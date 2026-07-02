import sys
import os
import json
import uuid
import hashlib

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from core.config import settings
from core.database import SessionLocal
from models.user import User
from models.resume import Resume
from models.queue_job import QueueJob
from services.queue_worker import execute_upload_job_logic, execute_optimize_job_logic

client = TestClient(app)

def test_extra_optimizations():
    print("\n--- Testing Gzip, Prompt Pruning & Cache Optimizations ---")
    
    # 1. Setup mock user
    db = SessionLocal()
    mock_user = db.query(User).filter(User.email == "test.extra@averion.com").first()
    if not mock_user:
        mock_user = User(clerk_id="google-sub-mock-extra", email="test.extra@averion.com")
        db.add(mock_user)
        db.commit()
        db.refresh(mock_user)
        
    print(f"Mock User: {mock_user.email}")
    
    # 2. Test Gzip write/read
    file_id = str(uuid.uuid4())
    mock_parsed_data = {
        "personal": {
            "name": "Jane Doe",
            "title": "Data Scientist",
            "email": "janedoe@gmail.com"
        },
        "experience": [{"company": "Meta", "role": "Intern"}]
    }
    
    mock_doc_path = os.path.join(settings.TEMP_DIR, f"{file_id}_original.txt")
    with open(mock_doc_path, "w") as f:
        f.write("Some original text")
        
    # Mock setups
    import services.r2_service
    import services.queue_worker
    import services.llm_service
    
    orig_access_key = settings.R2_ACCESS_KEY_ID
    orig_secret_key = settings.R2_SECRET_ACCESS_KEY
    settings.R2_ACCESS_KEY_ID = "mock-r2"
    settings.R2_SECRET_ACCESS_KEY = "mock-r2"
    
    original_upload = services.r2_service.upload_file_to_r2
    services.r2_service.upload_file_to_r2 = lambda local, remote: print(f"[Mocked R2 Upload] {local} -> {remote}")
    
    original_extract = services.queue_worker.extract_text_from_docx
    services.queue_worker.extract_text_from_docx = lambda path: "Candidate Name: Jane Doe"
    
    original_parse = services.llm_service.parse_resume
    services.llm_service.parse_resume = lambda text: mock_parsed_data
    
    original_optimize = services.llm_service.optimize_resume
    services.llm_service.optimize_resume = lambda r_data, jd_text, m, p: mock_parsed_data
    
    # Mock os.remove to be a no-op during upload execution so we can verify the compressed file
    orig_remove = os.remove
    os.remove = lambda path: print(f"[Mocked os.remove] skipped cleanup for {path}")
    
    local_json_path = os.path.join(settings.TEMP_DIR, f"{file_id}.json")
    
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        
        # Test Upload Gzipping
        print("Running upload job with Gzip compression offloading...")
        upload_job_id = f"test-extra-upload-{file_id}"
        u_job = QueueJob(
            id=upload_job_id,
            user_id=mock_user.id,
            type="upload",
            status="processing",
            payload=json.dumps({"file_id": file_id, "filename": "Jane_Doe.docx", "temp_path": mock_doc_path, "ext": ".docx"})
        )
        db.add(u_job)
        db.commit()
        
        loop.run_until_complete(
            execute_upload_job_logic(db, upload_job_id, mock_user.id, file_id, "Jane_Doe.docx", mock_doc_path, ".docx")
        )
        
        # Check that local file is Gzipped binary
        with open(local_json_path, "rb") as f:
            header = f.read(2)
        print("Magic bytes header (should be 1f8b for gzip):", header.hex())
        assert header == b'\x1f\x8b', "File is not Gzipped!"
        print("Success: File is compressed with gzip!")
        
        # Test automatic decompression via get_resume_json
        from api.routes import get_resume_json
        resume = db.query(Resume).filter(Resume.id == file_id).first()
        loaded_json = get_resume_json(resume)
        print("Decompressed and loaded JSON:", loaded_json)
        assert loaded_json["personal"]["name"] == "Jane Doe"
        print("Success: File successfully decompressed on-the-fly!")
        
        # 3. Test Prompt Pruning on optimize completion
        opt_job_id = f"test-extra-opt-{file_id}"
        opt_job = QueueJob(
            id=opt_job_id,
            user_id=mock_user.id,
            type="optimize",
            status="processing",
            payload=json.dumps({
                "file_id": file_id,
                "jd": "Data Analyst role",
                "resume_data": json.dumps(mock_parsed_data),
                "mode": "standard",
                "page_count": "auto"
            })
        )
        db.add(opt_job)
        db.commit()
        
        print("Running optimize job with payload prompt pruning...")
        loop.run_until_complete(
            execute_optimize_job_logic(
                db, opt_job_id, mock_user.id, file_id, "Data Analyst role", json.dumps(mock_parsed_data), "standard", "auto"
            )
        )
        
        # Re-fetch job: verify resume_data and jd are removed from payload!
        updated_job = db.query(QueueJob).filter(QueueJob.id == opt_job_id).first()
        payload_cleaned = json.loads(updated_job.payload)
        print("Cleaned completed job payload:", payload_cleaned)
        assert "jd" not in payload_cleaned, "Prompt history was not deleted!"
        assert "resume_data" not in payload_cleaned, "Original resume data was not deleted!"
        assert payload_cleaned["file_id"] == file_id
        print("Success: Prompt history and original resume data successfully pruned from payload on completion!")
        
        # 4. Test Duplicate Request Caching (SHA256 Hash query)
        print("Testing duplicate request caching check...")
        
        # Generate custom session JWT token
        from datetime import datetime, timedelta
        jwt_payload = {
            "user_id": mock_user.id,
            "email": mock_user.email,
            "exp": datetime.utcnow() + timedelta(minutes=5)
        }
        import jwt
        token = jwt.encode(jwt_payload, settings.JWT_SECRET, algorithm="HS256")
        
        # Write the payload_hash manually to the completed job to simulate caching
        input_str = f"{file_id}|||{'Data Analyst role'.strip()}|||{'standard'}|||{'auto'}"
        payload_hash = hashlib.sha256(input_str.encode('utf-8')).hexdigest()
        
        db.query(QueueJob).filter(QueueJob.id == opt_job_id).update({QueueJob.payload_hash: payload_hash})
        db.commit()
        
        # Trigger route POST /api/optimize
        response = client.post(
            "/api/optimize",
            data={
                "file_id": file_id,
                "jd": "Data Analyst role",
                "resume_data": json.dumps(mock_parsed_data),
                "mode": "standard",
                "page_count": "auto"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Optimize endpoint response status code:", response.status_code)
        print("Optimize endpoint response body:", response.json())
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        print("Success: Duplicate optimization request returned cached payload instantly!")
        
    finally:
        # Restore configurations
        settings.R2_ACCESS_KEY_ID = orig_access_key
        settings.R2_SECRET_ACCESS_KEY = orig_secret_key
        services.r2_service.upload_file_to_r2 = original_upload
        services.queue_worker.extract_text_from_docx = original_extract
        services.llm_service.parse_resume = original_parse
        services.llm_service.optimize_resume = original_optimize
        os.remove = orig_remove
        
        # Cleanup files
        if os.path.exists(mock_doc_path):
            try:
                orig_remove(mock_doc_path)
            except:
                pass
        if os.path.exists(local_json_path):
            try:
                orig_remove(local_json_path)
            except:
                pass
            
        db.close()
        
    print("All extra optimizations tests passed successfully!")

if __name__ == "__main__":
    test_extra_optimizations()
