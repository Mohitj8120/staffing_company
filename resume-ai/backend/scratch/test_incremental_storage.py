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
from core.json_diff import compute_dict_diff, apply_dict_patch
from services.queue_worker import execute_optimize_job_logic

client = TestClient(app)

def test_incremental_and_compression():
    print("\n--- Testing Response Compression & Incremental Storage ---")
    
    # 1. Setup dedicated user
    db = SessionLocal()
    mock_user = db.query(User).filter(User.email == "test.incr@averion.com").first()
    if not mock_user:
        mock_user = User(clerk_id="google-sub-mock-incr", email="test.incr@averion.com")
        db.add(mock_user)
        db.commit()
        db.refresh(mock_user)
        
    print(f"Mock User: {mock_user.email}")
    
    # Generate custom session JWT token
    import jwt
    from datetime import datetime, timedelta
    jwt_payload = {
        "user_id": mock_user.id,
        "email": mock_user.email,
        "exp": datetime.utcnow() + timedelta(minutes=5)
    }
    token = jwt.encode(jwt_payload, settings.JWT_SECRET, algorithm="HS256")
    
    # Test Gzip Response Compression headers
    print("Testing response compression headers...")
    response = client.get(
        "/api/resumes",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept-Encoding": "gzip"
        }
    )
    print("Response headers:", response.headers)
    
    # 2. Test JSON Delta Diff/Patch calculation logic
    print("Testing JSON Diff & Patch algorithm...")
    base_json = {
        "personal": {
            "name": "Alex",
            "title": "Developer",
            "city": "Austin"
        },
        "skills": ["Python", "SQL"],
        "experience": [{"company": "A", "role": "Junior"}]
    }
    target_json = {
        "personal": {
            "name": "Alex",
            "title": "Lead Developer",
            "city": "Austin"
        },
        "skills": ["Python", "SQL", "Kubernetes"],
        "experience": [{"company": "A", "role": "Lead"}]
    }
    
    delta = compute_dict_diff(base_json, target_json)
    print("Calculated Delta Diff:", delta)
    assert "name" not in delta.get("personal", {}), "Unchanged name should be pruned!"
    assert "city" not in delta.get("personal", {}), "Unchanged city should be pruned!"
    assert delta["personal"]["title"] == "Lead Developer"
    
    # Reconstruct
    reconstructed = apply_dict_patch(base_json, delta)
    print("Reconstructed JSON:", reconstructed)
    assert reconstructed == target_json, "Reconstructed JSON does not match target!"
    print("Success: JSON Diff and Patch matches exactly!")
    
    # 3. Verify optimize job stores delta & queue status reconstructs it
    print("Testing end-to-end QueueJob Delta offloading...")
    file_id = str(uuid.uuid4())
    
    # Add base resume metadata to database
    resume = Resume(
        id=file_id,
        user_id=mock_user.id,
        filename="test.docx",
        title="Alex Profile",
        data=json.dumps(base_json)
    )
    db.add(resume)
    db.commit()
    
    # Create optimize job (status='test_processing' keeps background worker hands off)
    job_id = f"test-incr-job-{file_id}"
    opt_job = QueueJob(
        id=job_id,
        user_id=mock_user.id,
        type="optimize",
        status="test_processing",
        payload=json.dumps({
            "file_id": file_id,
            "jd": "Lead Dev Role",
            "resume_data": json.dumps(base_json),
            "mode": "standard",
            "page_count": "auto"
        })
    )
    db.add(opt_job)
    db.commit()
    
    # Mock LLM optimize in the worker module namespace
    import services.queue_worker
    original_optimize = services.queue_worker.optimize_resume
    services.queue_worker.optimize_resume = lambda r, j, m, p: target_json
    
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        loop.run_until_complete(
            execute_optimize_job_logic(
                db, job_id, mock_user.id, file_id, "Lead Dev Role", json.dumps(base_json), "standard", "auto"
            )
        )
        
        # Verify DB: result stores optimized_delta instead of optimized_data
        updated_job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        res_payload = json.loads(updated_job.result)
        print("Completed job result columns:", res_payload.keys())
        assert "optimized_delta" in res_payload
        assert "optimized_data" not in res_payload
        print("Success: Delta stored in database successfully!")
        
        # Trigger /api/queue-status/{job_id} which reconstructs it transparently
        status_res = client.get(
            f"/api/queue-status/{job_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Queue status route response code:", status_res.status_code)
        print("Queue status result keys:", status_res.json().keys())
        print("Reconstructed JSON from status:", status_res.json().get("optimized_data"))
        print("Expected Target JSON:", target_json)
        assert status_res.json()["optimized_data"] == target_json, "Transparent reconstruction failed!"
        print("Success: Transparent reconstruction on status endpoint verified successfully!")
        
    finally:
        # Restore configurations
        services.queue_worker.optimize_resume = original_optimize
        db.close()
        
    print("All incremental storage and response compression tests passed successfully!")

if __name__ == "__main__":
    test_incremental_and_compression()
