import redis
from core.config import settings

# Initialize Redis client lazily if REDIS_URL is provided
redis_client = None

if settings.REDIS_URL:
    try:
        redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        # Test connection
        redis_client.ping()
        print("Connected to Redis for queue signaling!")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}. Queue will fall back to polling.")
        redis_client = None

def push_job_to_redis(job_id: str):
    """
    Pushes a job ID to the Redis list to signal workers immediately.
    """
    if redis_client:
        try:
            redis_client.rpush("gemini_jobs_queue", job_id)
            return True
        except Exception as e:
            print(f"Redis rpush error: {e}")
    return False

def pop_job_from_redis(timeout: int = 1) -> str:
    """
    Blocks on the Redis queue to retrieve the next job ID.
    Returns the job ID string, or None if it times out.
    """
    if redis_client:
        try:
            # blpop returns a tuple: (list_name, element)
            result = redis_client.blpop("gemini_jobs_queue", timeout=timeout)
            if result:
                return result[1]
        except Exception as e:
            print(f"Redis blpop error: {e}")
    return None
