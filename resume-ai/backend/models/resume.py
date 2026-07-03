from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    filename = Column(String)
    title = Column(String)
    data = Column(Text) # JSON string
    file_hash = Column(String, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    owner = relationship("User")
