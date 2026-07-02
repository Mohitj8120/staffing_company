import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from core.config import settings
from api.auth import get_current_user
from models.user import User
from models.queue_job import QueueJob
from core.database import SessionLocal

# Override the auth dependency to return a mock user
mock_user = User(id=1, clerk_id="mock-clerk-id", email="mohitjain1619@gmail.com", credits=10, subscription_status="pro")

async def override_get_current_user():
    return mock_user

app.dependency_overrides[get_current_user] = override_get_current_user

# Set MAX_CONCURRENT_REQUESTS to 1 for this test
settings.MAX_CONCURRENT_REQUESTS = 1

client = TestClient(app)

def test_overload_routing():
    print("Initializing routes test...")
    db = SessionLocal()
    db.query(QueueJob).delete()
    db.commit()
    
    # 1. Since MAX_CONCURRENT_REQUESTS is 1, let's insert a job with status 'processing'
    # to simulate the server being overloaded
    job = QueueJob(
        id="mock-processing-job",
        user_id=1,
        type="optimize",
        status="processing",
        payload="{}"
    )
    db.add(job)
    db.commit()
    
    # 2. Call the optimize endpoint which should now be queued
    print("Calling /api/optimize endpoint under simulated overload...")
    response = client.post(
        "/api/optimize",
        data={
            "file_id": "test-file",
            "jd": "React developer",
            "resume_data": json.dumps({"personal": {"name": "Mohit"}}),
            "mode": "standard",
            "page_count": "auto"
        }
    )
    
    print("Response status code:", response.status_code)
    print("Response JSON:", response.json())
    
    result = response.json()
    assert result["status"] == "queued"
    assert result["position"] == 2
    assert "job_id" in result
    print("Queue overload routing verified successfully!")
    
    # 3. Test queue-status endpoint
    job_id = result["job_id"]
    status_response = client.get(f"/api/queue-status/{job_id}")
    print("Queue status response:", status_response.json())
    assert status_response.json()["status"] == "queued"
    assert status_response.json()["position"] == 2
    print("Queue status endpoint verified successfully!")

    db.close()

if __name__ == "__main__":
    test_overload_routing()
