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
from models import base, user, resume, queue_job, affiliate

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

# Self-healing database migration: add file_hash if missing to resumes
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE resumes ADD COLUMN file_hash VARCHAR(255)"))
        try:
            conn.commit()
        except:
            pass
        print("Self-healing: Checked/added file_hash column to resumes table.")
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

# Self-healing database migration: add preference columns if missing to users
try:
    with engine.connect() as conn:
        columns_to_add = [
            ("opt_strategy", "VARCHAR(255) DEFAULT 'Advanced ATS tailoring (STAR Achievement focus)'"),
            ("default_tone", "VARCHAR(255) DEFAULT 'Professional Executive (Standard Silicon Valley SDE/PM)'"),
            ("preserve_grades", "BOOLEAN DEFAULT TRUE"),
            ("auto_shorten", "BOOLEAN DEFAULT TRUE")
        ]
        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                try:
                    conn.commit()
                except:
                    pass
                print(f"Self-healing: Added {col_name} column to users table.")
            except Exception as inner_e:
                pass
except Exception as e:
    print(f"Self-healing users error: {e}")

# Self-healing database migration: create affiliate tables if missing
try:
    with engine.connect() as conn:
        affiliate_tables = [
            """CREATE TABLE IF NOT EXISTS affiliates (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                commission_rate FLOAT DEFAULT 0.25,
                upi_id VARCHAR(255),
                bank_account VARCHAR(255),
                bank_ifsc VARCHAR(20),
                bank_name VARCHAR(255),
                social_url VARCHAR(500),
                admin_notes TEXT,
                min_payout INTEGER DEFAULT 1000,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE,
                approved_at TIMESTAMP WITH TIME ZONE
            )""",
            """CREATE TABLE IF NOT EXISTS affiliate_clicks (
                id SERIAL PRIMARY KEY,
                affiliate_id INTEGER REFERENCES affiliates(id),
                ip_hash VARCHAR(64),
                user_agent VARCHAR(500),
                referrer VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )""",
            """CREATE TABLE IF NOT EXISTS affiliate_signups (
                id SERIAL PRIMARY KEY,
                affiliate_id INTEGER REFERENCES affiliates(id),
                referred_user_id INTEGER REFERENCES users(id),
                ref_code_used VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )""",
            """CREATE TABLE IF NOT EXISTS affiliate_payouts (
                id SERIAL PRIMARY KEY,
                affiliate_id INTEGER REFERENCES affiliates(id),
                amount FLOAT NOT NULL,
                method VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'completed',
                transaction_ref VARCHAR(255),
                admin_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )""",
            """CREATE TABLE IF NOT EXISTS affiliate_sales (
                id SERIAL PRIMARY KEY,
                affiliate_id INTEGER REFERENCES affiliates(id),
                referred_user_id INTEGER REFERENCES users(id),
                razorpay_payment_id VARCHAR(255) UNIQUE,
                razorpay_order_id VARCHAR(255),
                plan_purchased VARCHAR(50),
                amount_paid FLOAT DEFAULT 0,
                commission_amount FLOAT DEFAULT 0,
                commission_rate FLOAT DEFAULT 0.25,
                cookie_ref VARCHAR(50),
                status VARCHAR(20) DEFAULT 'confirmed',
                payout_id INTEGER REFERENCES affiliate_payouts(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )"""
        ]
        for table_sql in affiliate_tables:
            try:
                conn.execute(text(table_sql))
                try:
                    conn.commit()
                except:
                    pass
            except Exception as inner_e:
                pass
        # Create indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code)",
            "CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id)",
            "CREATE INDEX IF NOT EXISTS idx_affiliate_signups_affiliate_id ON affiliate_signups(affiliate_id)",
            "CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate_id ON affiliate_sales(affiliate_id)",
            "CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id)"
        ]
        for idx_sql in indexes:
            try:
                conn.execute(text(idx_sql))
                try:
                    conn.commit()
                except:
                    pass
            except:
                pass
        print("Self-healing: Checked/created affiliate system tables and indexes.")
except Exception as e:
    print(f"Self-healing affiliate tables error: {e}")

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

from api.affiliate_routes import router as affiliate_router
app.include_router(affiliate_router, prefix="/api/affiliate")

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

# Force redeployment trigger
