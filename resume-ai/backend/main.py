import sentry_sdk
from core.config import settings

# Filter out common user-generated client errors (401, 404, 422) to keep Sentry free quota safe!
def before_send(event, hint):
    if 'exc_info' in hint:
        exc_type, exc_value, tb = hint['exc_info']
        # If it's a FastAPI HTTPException with 4xx status, skip sending it to Sentry
        from fastapi import HTTPException
        if isinstance(exc_value, HTTPException) and 400 <= exc_value.status_code < 500:
            return None
        # Check standard Starlette/FastAPI validation exception
        from fastapi.exceptions import RequestValidationError
        if isinstance(exc_value, RequestValidationError):
            return None
    return event

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,  # Performance monitoring sample rate (10%)
        profiles_sample_rate=0.1,  # Performance profiling sample rate (10%)
        before_send=before_send,
        send_default_pii=False,  # Security first: do not send default PII
    )
    print("Sentry Backend SDK initialized successfully (with cost-saving filters)!")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from models import base, user, resume, queue_job

# Create tables
base.Base.metadata.create_all(bind=engine)

# Self-healing database migration: add payload_hash if missing
from sqlalchemy import text
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE queue_jobs ADD COLUMN payload_hash VARCHAR(255)"))
        try:
            conn.commit()
        except:
            pass
        print("Self-healing: Checked/added payload_hash column to queue_jobs table.")
except Exception as e:
    pass

# Self-healing database indexing: add indexes to resumes if missing
try:
    with engine.connect() as conn:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at)"))
        try:
            conn.commit()
        except:
            pass
        print("Self-healing: Checked/added database indexes for resumes table.")
except Exception as e:
    pass

app = FastAPI(title=settings.PROJECT_NAME)

# Setup GZip Response Compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Ultimate AI Resume Builder API"}

from api.routes import router as api_router
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    import asyncio
    from services.queue_worker import queue_worker_loop
    asyncio.create_task(queue_worker_loop())

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
