import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine, SessionLocal
from core.config import settings
from services.redis_service import redis_client, push_job_to_redis, pop_job_from_redis
from services.r2_service import r2_client, upload_file_to_r2, download_file_from_r2, get_r2_url

def test_database_connection():
    print("\n--- Testing Database Engine & Pool ---")
    db = SessionLocal()
    try:
        # Simple dialect check
        dialect = engine.dialect.name
        print(f"Database dialect in use: {dialect}")
        # Run a simple raw select query to test connection
        from sqlalchemy import text
        result = db.execute(text("SELECT 1")).scalar()
        print(f"Select connection test result: {result} (expected: 1)")
        assert result == 1, "Database select query failed!"
        print("Database connection pool initialized successfully!")
    finally:
        db.close()

def test_redis_fallback():
    print("\n--- Testing Redis Queue Client ---")
    if settings.REDIS_URL:
        print(f"Redis is configured with URL: {settings.REDIS_URL}")
        if redis_client is not None:
            # Let's test queue push & pop signaling
            test_job_id = "test-infra-redis-job-id"
            pushed = push_job_to_redis(test_job_id)
            print(f"Pushed test job to Redis: {pushed}")
            assert pushed, "Failed to push job ID to Redis!"
            
            popped = pop_job_from_redis(timeout=1)
            print(f"Popped test job from Redis: {popped}")
            assert popped == test_job_id, "Popped job ID did not match pushed job ID!"
            print("Redis signaling queue works perfectly!")
        else:
            print("Redis URL was provided but connection failed. Fallback to SQL polling is enabled.")
    else:
        print("Redis is not configured. Falling back to SQL polling (correct default behavior).")
        assert redis_client is None, "redis_client should be None when REDIS_URL is not set!"
        print("Redis client fallback verified successfully.")

def test_r2_fallback():
    print("\n--- Testing Cloudflare R2 Client ---")
    if r2_client is not None:
        print(f"R2 client initialized successfully for bucket: {settings.R2_BUCKET_NAME}")
        # We can test public url generation
        test_filename = "test_resume.pdf"
        url = get_r2_url(test_filename)
        print(f"Generated URL for {test_filename}: {url}")
        assert url is not None, "Failed to generate R2 url!"
    else:
        print("R2 credentials not fully configured. Local filesystem storage fallback is enabled.")
        # Local fallback test
        test_filename = "test_resume.pdf"
        url = get_r2_url(test_filename)
        print(f"Generated local URL fallback: {url}")
        assert url == f"/api/download/{test_filename}", "Local URL fallback mismatch!"
        print("R2 local fallback verified successfully.")

if __name__ == "__main__":
    test_database_connection()
    test_redis_fallback()
    test_r2_fallback()
