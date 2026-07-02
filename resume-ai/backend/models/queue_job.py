import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from .base import Base

class QueueJob(Base):
    __tablename__ = "queue_jobs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    type = Column(String, nullable=False) # 'upload' or 'optimize'
    status = Column(String, default="queued", index=True) # 'queued', 'processing', 'completed', 'failed'
    payload = Column(Text) # JSON string of inputs
    payload_hash = Column(String, index=True, nullable=True) # Hash for duplicate detection
    result = Column(Text) # JSON string of outputs/errors
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
