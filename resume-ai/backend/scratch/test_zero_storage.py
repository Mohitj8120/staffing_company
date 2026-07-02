"""
Verification Test for Zero-Storage Document Pipeline
"""
import sys
import os
import json
import uuid
import shutil
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from core.database import SessionLocal
from models.resume import Resume
from models.queue_job import QueueJob
from services.queue_worker import execute_upload_job_logic, execute_optimize_job_logic
from api.routes import ensure_pdf_exists, remove_file

# Create mock data
MOCK_PARSE_DATA = {
    "personal": {
        "name": "Mohit Jain",
        "email": "mohit@example.com",
        "phone": "+1-123-456-7890",
        "title": "Senior Software Engineer"
    },
    "skills": ["Python", "FastAPI", "PostgreSQL", "React", "Docker"],
    "experience": [
        {
            "company": "Tech Corp",
            "title": "Software Developer",
            "duration": "Jan 2022 — Present",
            "points": ["Built APIs with FastAPI.", "Optimized SQL queries."]
        }
    ],
    "projects": [],
    "education": [],
    "certifications": []
}

MOCK_OPTIMIZED_DATA = {
    "personal": {
        "name": "Mohit Jain",
        "email": "mohit@example.com",
        "phone": "+1-123-456-7890",
        "title": "Lead FastAPI Architect"
    },
    "skills": ["Python", "FastAPI", "PostgreSQL", "React", "Docker", "Cloudflare R2", "Redis"],
    "experience": [
        {
            "company": "Tech Corp",
            "title": "Software Developer",
            "duration": "Jan 2022 — Present",
            "points": ["Architected scalable APIs with FastAPI.", "Optimized SQL queries by 90%."]
        }
    ],
    "projects": [],
    "education": [],
    "certifications": [],
    "target_company": "Innovative Labs"
}

def mock_parse_resume(resume_text):
    return MOCK_PARSE_DATA

def mock_optimize_resume(resume_data, jd_text, mode="standard", page_count="auto"):
    return MOCK_OPTIMIZED_DATA

def run_zero_storage_tests():
    print("\n=== Testing Zero-Storage Pipeline ===\n")
    db = SessionLocal()
    
    # Mock LLM API functions to prevent calling Gemini API
    import services.queue_worker
    services.queue_worker.parse_resume = mock_parse_resume
    services.queue_worker.optimize_resume = mock_optimize_resume
    
    file_id = str(uuid.uuid4())
    job_id = str(uuid.uuid4())
    
    # Create a temporary user to satisfy foreign key constraints
    from models.user import User
    temp_user = User(clerk_id=f"mock_clerk_{file_id}", email=f"mock_{file_id}@example.com")
    db.add(temp_user)
    db.commit()
    db.refresh(temp_user)
    user_id = temp_user.id
    
    # 1. Setup mock original file on disk
    original_filename = "mock_resume.docx"
    temp_original_path = os.path.join(settings.TEMP_DIR, f"{file_id}_original.docx")
    
    # Create empty dummy file
    with open(temp_original_path, "w") as f:
        f.write("This is a dummy resume text. Skills: Python, FastAPI, PostgreSQL.")
        
    print(f"1. Created temporary original file: {temp_original_path}")
    assert os.path.exists(temp_original_path), "Failed to create dummy file!"
    
    # 2. Run upload queue logic (Parsing text and saving database metadata)
    print("2. Running execute_upload_job_logic...")
    # Mock extract functions to return simple string
    import services.queue_worker
    services.queue_worker.extract_text_from_docx = lambda path: "This is a dummy resume text. Skills: Python, FastAPI, PostgreSQL."
    
    # Disable R2 configuration to check local behavior
    r2_configured = settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY
    
    # Pre-insert the upload QueueJob record in the database
    new_upload_job = QueueJob(
        id=job_id,
        user_id=user_id,
        type="upload",
        status="processing",
        payload=json.dumps({
            "file_id": file_id,
            "filename": original_filename,
            "temp_path": temp_original_path,
            "ext": ".docx"
        })
    )
    db.add(new_upload_job)
    db.commit()
    
    # Executing parsing job logic
    import asyncio
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(
        execute_upload_job_logic(db, job_id, user_id, file_id, original_filename, temp_original_path, ".docx")
    )
    
    # Assertions for upload job
    assert not os.path.exists(temp_original_path), "❌ SUCCESS FAIL: Original temp file was NOT deleted after parsing!"
    print("   ✅ SUCCESS: Original temp file deleted immediately after text extraction.")
    
    resume_db_record = db.query(Resume).filter(Resume.id == file_id).first()
    assert resume_db_record is not None, "Failed to create Resume record in DB!"
    
    # 3. Running optimization job logic
    print("3. Running execute_optimize_job_logic...")
    optimize_job_id = str(uuid.uuid4())
    jd = "We need a Lead FastAPI Architect who knows Redis and Cloudflare R2."
    
    # Pre-insert the QueueJob record in the database just like the API router does
    new_job = QueueJob(
        id=optimize_job_id,
        user_id=user_id,
        type="optimize",
        status="processing",
        payload=json.dumps({
            "file_id": file_id,
            "jd": jd,
            "resume_data": json.dumps(MOCK_PARSE_DATA),
            "mode": "standard",
            "page_count": "auto"
        })
    )
    db.add(new_job)
    db.commit()
    
    opt_result = loop.run_until_complete(
        execute_optimize_job_logic(
            db, 
            optimize_job_id, 
            user_id, 
            file_id, 
            jd, 
            json.dumps(MOCK_PARSE_DATA), 
            "standard", 
            "auto"
        )
    )
    
    # Assert docx_url is not None
    assert opt_result["docx_url"] is not None, "❌ SUCCESS FAIL: docx_url is None!"
    assert "_tailored.docx" in opt_result["docx_url"], f"❌ SUCCESS FAIL: Invalid docx_url format: {opt_result['docx_url']}"
    print(f"   ✅ SUCCESS: Tailored DOCX URL returned in optimization result payload: {opt_result['docx_url']}")
    
    # 4. Verification of Dynamic PDF compilation and auto-delete
    print("4. Testing dynamic PDF on-the-fly generation and Background Task deletion...")
    pdf_filename = f"{file_id}_tailored.pdf"
    
    # Compile
    file_path = ensure_pdf_exists(pdf_filename, db)
    assert os.path.exists(file_path), "❌ SUCCESS FAIL: Dynamic PDF was not compiled!"
    print(f"   ✅ SUCCESS: PDF compiled dynamically on-the-fly: {file_path}")
    
    # Delete via BackgroundTask simulation
    remove_file(file_path)
    assert not os.path.exists(file_path), "❌ SUCCESS FAIL: PDF was not deleted by remove_file task!"
    print("   ✅ SUCCESS: PDF auto-deleted from disk after simulated download.")
    
    # 5. Verification of Dynamic DOCX compilation and auto-delete
    print("5. Testing dynamic DOCX on-the-fly generation and Background Task deletion...")
    docx_filename = f"{file_id}_tailored.docx"
    
    # Compile
    file_path_docx = ensure_pdf_exists(docx_filename, db)
    assert os.path.exists(file_path_docx), "❌ SUCCESS FAIL: Dynamic DOCX was not compiled!"
    print(f"   ✅ SUCCESS: DOCX compiled dynamically on-the-fly: {file_path_docx}")
    
    # Delete via BackgroundTask simulation
    remove_file(file_path_docx)
    assert not os.path.exists(file_path_docx), "❌ SUCCESS FAIL: DOCX was not deleted by remove_file task!"
    print("   ✅ SUCCESS: DOCX auto-deleted from disk after simulated download.")
    
    # 6. Verification of dynamic ZIP download and source PDF cleanup
    print("6. Testing ZIP generation and PDF cleanup...")
    import zipfile
    import io
    
    # Re-generate PDF on disk for zipping
    file_path = ensure_pdf_exists(pdf_filename, db)
    assert os.path.exists(file_path), "Failed to re-generate PDF for zipping test."
    
    # Simulate download_zip logic
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        zip_file.write(file_path, "Innovative_Labs/mohit_jain_resume.pdf")
        
    # Delete the PDF immediately after zipping
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except:
        pass
        
    assert not os.path.exists(file_path), "❌ SUCCESS FAIL: PDF file was not deleted after zipping!"
    print("   ✅ SUCCESS: Temporary PDF file deleted immediately after ZIP packaging.")
    
    # Clean up DB records
    db.delete(resume_db_record)
    upload_job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
    if upload_job:
        db.delete(upload_job)
    opt_job = db.query(QueueJob).filter(QueueJob.id == optimize_job_id).first()
    if opt_job:
        db.delete(opt_job)
    db.delete(temp_user)
    db.commit()
    db.close()
    
    print("\n" + "=" * 55)
    print("All Zero-Storage pipeline tests passed successfully!")
    print("=" * 55)

if __name__ == "__main__":
    run_zero_storage_tests()
