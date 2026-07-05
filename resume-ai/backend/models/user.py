from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    credits = Column(Integer, default=5)
    subscription_status = Column(String, default="free")
    opt_strategy = Column(String, default="Advanced ATS tailoring (STAR Achievement focus)")
    default_tone = Column(String, default="Professional Executive (Standard Silicon Valley SDE/PM)")
    preserve_grades = Column(Boolean, default=True)
    auto_shorten = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
