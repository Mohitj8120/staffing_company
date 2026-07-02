import sys
import os
import asyncio
import json
import uuid
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.queue_job import QueueJob
from services.queue_worker import queue_worker_loop, process_job

async def test_queue_behavior():
    print("Initializing test...")
    db = SessionLocal()
    
    # Clean database jobs first
    db.query(QueueJob).delete()
    db.commit()
    
    # 1. Insert a mock optimize job with status 'queued'
    job_id = str(uuid.uuid4())
    job = QueueJob(
        id=job_id,
        user_id=1,
        type="optimize",
        status="queued",
        payload=json.dumps({
            "file_id": "test-file-id",
            "jd": "Software Engineer job description",
            "resume_data": json.dumps({
                "personal": {"name": "Test User", "title": "Developer"},
                "skills": ["Python", "FastAPI"]
            }),
            "mode": "standard",
            "page_count": "auto"
        })
    )
    db.add(job)
    db.commit()
    print(f"Inserted job {job_id} into queue.")
    
    # 2. Check position of the job
    position = db.query(QueueJob).filter(
        QueueJob.status.in_(["queued", "processing"]),
        QueueJob.created_at < job.created_at
    ).count() + 1
    print(f"Calculated queue position: {position} (expected: 1)")
    assert position == 1
    
    # 3. Trigger worker processing directly for this job
    print("Processing job...")
    try:
        await process_job(job_id)
        # Refresh job from DB
        db.refresh(job)
        print(f"After processing - Job status: {job.status}")
        print(f"After processing - Job result: {job.result}")
    except Exception as e:
        print(f"Failed to process job: {e}")
        
    db.close()

if __name__ == "__main__":
    asyncio.run(test_queue_behavior())
