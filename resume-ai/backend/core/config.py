import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ultimate AI Resume Builder"
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEYS: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    MAX_CONCURRENT_REQUESTS: int = 3
    
    # Production Infrastructure Settings
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    REDIS_URL: str = ""
    R2_BUCKET_NAME: str = ""
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_PUBLIC_CUSTOM_DOMAIN: str = ""
    STRIPE_SECRET_KEY: str = ""
    
    # Custom JWT & Google OAuth Settings (₹0 Cost Auth)
    JWT_SECRET: str = "averion-super-secret-jwt-key-2026"
    GOOGLE_CLIENT_ID: str = ""
    
    # Razorpay Configuration (Affiliate Tracking)
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_KEY_ID: str = ""
    
    # Sentry Configuration
    SENTRY_DSN: str = ""
    ENV: str = "development"
    
    # Directory paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    TEMP_DIR: str = os.path.join(DATA_DIR, "temp")
    TEMPLATES_DIR: str = os.path.join(BASE_DIR, "templates")

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.TEMP_DIR, exist_ok=True)
os.makedirs(settings.TEMPLATES_DIR, exist_ok=True)
