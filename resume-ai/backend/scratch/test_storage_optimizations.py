import sys
import os
import json
import uuid

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

def test_database_offloading_and_dynamic_rendering():
    print("\n--- Testing Storage & DB offloading optimizations ---")
    
    # 1. Setup mock user in SQLite test DB
    db = SessionLocal()
    mock_user = db.query(User).filter(User.email == "test.storage@averion.com").first()
    if not mock_user:
        mock_user = User(clerk_id="google-sub-mock-storage", email="test.storage@averion.com")
        db.add(mock_user)
        db.commit()
        db.refresh(mock_user)
        
    print(f"Mock User ID: {mock_user.id}, Email: {mock_user.email}")
    
    # Create mock resume text file
    file_id = str(uuid.uuid4())
    mock_doc_path = os.path.join(settings.TEMP_DIR, f"{file_id}_original.txt")
    with open(mock_doc_path, "w", encoding="utf-8") as f:
        f.write("Candidate Name: John Doe\nJob Title: Software Engineer\nExperience: 5 years at Google.")
        
    # Mock upload logic
    print("Executing upload job logic (which parses and offloads to R2 if configured)...")
    
    # Mock parse_resume to return a valid schema
    mock_parsed_data = {
        "personal": {
            "name": "John Doe",
            "title": "Software Engineer",
            "email": "johndoe@gmail.com"
        },
        "experience": []
    }
    
    # Run upload logic
    job_id = f"test-upload-job-{file_id}"
    upload_job = QueueJob(
        id=job_id,
        user_id=mock_user.id,
        type="upload",
        status="processing",
        payload=json.dumps({"file_id": file_id, "filename": "John_Doe.docx", "temp_path": mock_doc_path, "ext": ".docx"})
    )
    db.add(upload_job)
    db.commit()
    
    # We will temporarily mock the R2 upload to simulate a successful offload
    # even if R2 credentials aren't provided by the user yet
    orig_access_key = settings.R2_ACCESS_KEY_ID
    orig_secret_key = settings.R2_SECRET_ACCESS_KEY
    
    settings.R2_ACCESS_KEY_ID = "mock-r2-key"
    settings.R2_SECRET_ACCESS_KEY = "mock-r2-secret"
    
    # Mock r2 upload and docx parsing
    import services.r2_service
    import services.queue_worker
    
    original_upload = services.r2_service.upload_file_to_r2
    services.r2_service.upload_file_to_r2 = lambda local, remote: print(f"[Mocked R2 Upload] {local} -> {remote}")
    
    original_extract = services.queue_worker.extract_text_from_docx
    services.queue_worker.extract_text_from_docx = lambda path: "Candidate Name: John Doe\nJob Title: Software Engineer\nExperience: 5 years at Google."
    
    tailored_path = None
    try:
        # Run worker upload job
        import asyncio
        loop = asyncio.get_event_loop()
        loop.run_until_complete(
            execute_upload_job_logic(db, job_id, mock_user.id, file_id, "John_Doe.docx", mock_doc_path, ".docx")
        )
        
        # Check database: Resume.data should be empty!
        resume = db.query(Resume).filter(Resume.id == file_id).first()
        assert resume is not None, "Resume not created!"
        print(f"Database Resume.data content: '{resume.data}'")
        assert resume.data == "", "Data was not offloaded to R2! It should be empty."
        print("Success: Resume data successfully offloaded to R2 and cleared from DB column!")
        
        # 2. Run optimize logic (skip Playwright compiling)
        opt_job_id = f"test-opt-job-{file_id}"
        opt_job = QueueJob(
            id=opt_job_id,
            user_id=mock_user.id,
            type="optimize",
            status="processing",
            payload=json.dumps({
                "file_id": file_id,
                "jd": "React Software Engineer",
                "resume_data": json.dumps(mock_parsed_data),
                "mode": "standard",
                "page_count": "auto"
            })
        )
        db.add(opt_job)
        db.commit()
        
        print("Executing optimize job logic...")
        result = loop.run_until_complete(
            execute_optimize_job_logic(
                db, opt_job_id, mock_user.id, file_id, "React Software Engineer", json.dumps(mock_parsed_data), "standard", "auto"
            )
        )
        
        tailored_filename = f"{file_id}_tailored.pdf"
        tailored_path = os.path.join(settings.TEMP_DIR, tailored_filename)
        
        # Verify no PDF file exists locally (since it is compiled on-the-fly later!)
        if os.path.exists(tailored_path):
            os.remove(tailored_path)
            
        print("PDF file exists locally?", os.path.exists(tailored_path))
        assert not os.path.exists(tailored_path), "PDF should not be generated during optimization!"
        print("Success: Playwright compilation skipped at optimization time!")
        
        # Mock download from R2 to fail so it falls back to dynamic generation
        services.r2_service.download_file_from_r2 = lambda remote, local: False
        
        # 3. Request download from route to trigger dynamic compilation
        print("Calling /api/download protected route to trigger dynamic compilation...")
        
        # Generate custom session JWT token
        import jwt
        from datetime import datetime, timedelta
        payload = {
            "user_id": mock_user.id,
            "email": mock_user.email,
            "exp": datetime.utcnow() + timedelta(minutes=5)
        }
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        
        response = client.get(
            f"/api/download/{tailored_filename}",
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Download endpoint response status code:", response.status_code)
        assert response.status_code == 200, "On-the-fly PDF download failed!"
        assert os.path.exists(tailored_path), "PDF file was not compiled on-the-fly!"
        print("Success: PDF was successfully compiled on-the-fly and returned to client!")
        
    finally:
        # Restore configurations
        settings.R2_ACCESS_KEY_ID = orig_access_key
        settings.R2_SECRET_ACCESS_KEY = orig_secret_key
        services.r2_service.upload_file_to_r2 = original_upload
        services.queue_worker.extract_text_from_docx = original_extract
        
        # Cleanup
        if os.path.exists(mock_doc_path):
            os.remove(mock_doc_path)
        if tailored_path and os.path.exists(tailored_path):
            os.remove(tailored_path)
        db.close()
        
    print("All storage optimization tests passed successfully!")

if __name__ == "__main__":
    test_database_offloading_and_dynamic_rendering()
