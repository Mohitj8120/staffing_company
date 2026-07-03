import os
import sys
import uuid
import json
import re
import urllib.parse
import asyncio
import traceback
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add the backend root directory to Python's search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from core.database import SessionLocal
from models.queue_job import QueueJob
from models.user import User
from models.resume import Resume
from services.doc_processor import extract_text_from_docx, extract_text_from_pdf, generate_stunning_pdf, start_pdf_render_process
from services.llm_service import parse_resume, optimize_resume

async def execute_optimize_job_logic(db: Session, job_id: str, user_id: int, file_id: str, jd: str, resume_data: str, mode: str, page_count: str):
    try:
        data = json.loads(resume_data)
        
        # Optimize with Gemini (offload to thread since it's a synchronous blocking operation)
        optimized_data = await asyncio.to_thread(optimize_resume, data, jd, mode, page_count)
        
        # Carry over original page count to optimized data
        if "original_page_count" in data:
            optimized_data["original_page_count"] = data["original_page_count"]
        
        # Format candidate and company names
        person_name = optimized_data.get("personal", {}).get("name", "candidate")
        person_name = re.sub(r'[^a-zA-Z0-9\s]', '', person_name).strip().replace(' ', '_').lower()
        if not person_name:
            person_name = "candidate"
            
        company_name = optimized_data.get("target_company", "Company").strip()
        if not company_name:
            company_name = "Company"
        company_name = re.sub(r'[^a-zA-Z0-9\s-]', '', company_name).strip()
        
        # Pre-generate the PDF immediately using Playwright
        pdf_filename = f"{file_id}_tailored.pdf"
        local_pdf_path = os.path.join(settings.TEMP_DIR, pdf_filename)
        
        print(f"Direct PDF: Compiling optimized PDF for {person_name} ({company_name})...")
        await asyncio.to_thread(
            generate_stunning_pdf,
            optimized_data,
            pdf_filename,
            mode,
            page_count
        )
        
        # Save locally in company folder structure permanently
        import shutil
        company_dir = os.path.join(settings.DATA_DIR, "resumes", company_name)
        os.makedirs(company_dir, exist_ok=True)
        
        saved_pdf_filename = f"{person_name}_Resume.pdf"
        saved_pdf_path = os.path.join(company_dir, saved_pdf_filename)
        shutil.copy(local_pdf_path, saved_pdf_path)
        print(f"Direct PDF: Saved tailored PDF locally to {saved_pdf_path}")
        
        # Upload to R2 if credentials are set
        r2_key = f"resumes/{company_name}/{saved_pdf_filename}"
        pdf_url = f"/api/download/{saved_pdf_filename}?company={urllib.parse.quote(company_name)}&job_id={job_id}"
        
        if settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY:
            try:
                from services.r2_service import upload_file_to_r2
                r2_url = await asyncio.to_thread(upload_file_to_r2, saved_pdf_path, r2_key)
                if r2_url:
                    print(f"Direct PDF: Tailored PDF uploaded to R2: {r2_key}")
            except Exception as r2_err:
                print(f"Warning: Failed to upload tailored PDF to R2: {r2_err}")
        
        from core.json_diff import compute_dict_diff
        optimized_delta = compute_dict_diff(data, optimized_data)
        
        result_payload = {
            "optimized_delta": optimized_delta,
            "company_name": company_name,
            "pdf_url": pdf_url,
            "zip_url": None,
            "docx_url": None
        }
        
        # Deduct credit if user is free and not admin
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            is_admin = user.email == "mohitjain1619@gmail.com"
            if user.subscription_status == "free" and not is_admin:
                user.credits -= 1
            
        # Update job & clean payload to save space
        job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.result = json.dumps(result_payload)
            
            try:
                payload_dict = json.loads(job.payload)
                cleaned_payload = {
                    "file_id": payload_dict.get("file_id"),
                    "mode": payload_dict.get("mode", "standard"),
                    "page_count": payload_dict.get("page_count", "auto")
                }
                job.payload = json.dumps(cleaned_payload)
            except:
                pass
                
            job.updated_at = datetime.utcnow()
            
        db.commit()
        return result_payload
    except Exception as e:
        db.rollback()
        err_msg = str(e)
        print(f"Error executing optimize job logic: {err_msg}")
        traceback.print_exc()
        
        job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.result = json.dumps({"error": err_msg})
            job.updated_at = datetime.utcnow()
            db.commit()
        raise e

async def execute_upload_job_logic(db: Session, job_id: str, user_id: int, file_id: str, filename: str, temp_path: str, ext: str):
    try:
        # Calculate file hash for duplicate detection
        import hashlib
        file_hash = None
        if os.path.exists(temp_path):
            with open(temp_path, "rb") as f:
                file_hash = hashlib.md5(f.read()).hexdigest()

        # Extract text and original page count
        original_page_count = 1
        if ext == ".pdf":
            try:
                import fitz
                doc = fitz.open(temp_path)
                original_page_count = len(doc)
                doc.close()
            except Exception as e:
                print(f"Error reading original PDF page count: {e}")
            text = extract_text_from_pdf(temp_path)
        else:
            text = extract_text_from_docx(temp_path)
            # Estimate pages for DOCX based on word count
            word_count = len(text.split())
            original_page_count = 1 if word_count < 450 else 2
        
        # Zero-Storage: Delete the original temp file immediately since text is in memory
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                print(f"Zero-Storage: Deleted temp original file: {temp_path}")
        except Exception as e:
            print(f"Zero-Storage: Failed to delete temp original file {temp_path}: {e}")
        
        # Parse text to JSON
        parsed_data = await asyncio.to_thread(parse_resume, text)
        parsed_data["original_page_count"] = original_page_count
        
        # Save parsed data to DB
        title = filename
        if parsed_data.get("personal", {}).get("title"):
            person_name = parsed_data.get("personal", {}).get("name", "")
            job_title = parsed_data.get("personal", {}).get("title", "")
            title = f"{person_name} - {job_title}" if person_name else job_title

        # Save parsed data (offload compressed to R2 in production, fall back to DB column in dev)
        r2_uploaded = False
        json_data_str = json.dumps(parsed_data)
        
        if settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY:
            try:
                import gzip
                json_temp_filename = f"{file_id}.json"
                json_temp_path = os.path.join(settings.TEMP_DIR, json_temp_filename)
                
                # Gzip compress and write as binary
                compressed_bytes = gzip.compress(json_data_str.encode('utf-8'))
                with open(json_temp_path, "wb") as f:
                    f.write(compressed_bytes)
                    
                from services.r2_service import upload_file_to_r2
                r2_key = f"resumes/{file_id}.json"
                await asyncio.to_thread(upload_file_to_r2, json_temp_path, r2_key)
                
                if os.path.exists(json_temp_path):
                    os.remove(json_temp_path)
                r2_uploaded = True
                print(f"Resume JSON compressed and offloaded to R2: {r2_key}")
            except Exception as r2_err:
                print(f"Warning: Failed to offload JSON to R2, falling back to DB: {r2_err}")
                
        new_resume = Resume(
            id=file_id,
            user_id=user_id,
            filename=filename,
            title=title,
            data="" if r2_uploaded else json_data_str,
            file_hash=file_hash
        )
        db.add(new_resume)
        
        # Zero-Storage: Do NOT upload original document to R2. We don't store it at all.
        
        result_payload = {
            "file_id": file_id,
            "data": parsed_data
        }
        
        # Update job
        job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.result = json.dumps(result_payload)
            job.updated_at = datetime.utcnow()
            
        db.commit()
        return result_payload
    except Exception as e:
        db.rollback()
        err_msg = str(e)
        print(f"Error executing upload job logic: {err_msg}")
        traceback.print_exc()
        
        job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.result = json.dumps({"error": err_msg})
            job.updated_at = datetime.utcnow()
            db.commit()
        raise e

async def process_job(job_id: str):
    db = SessionLocal()
    try:
        job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        if not job:
            return
            
        payload = json.loads(job.payload)
        
        if job.type == "optimize":
            await execute_optimize_job_logic(
                db, 
                job.id, 
                job.user_id, 
                payload["file_id"], 
                payload["jd"], 
                payload["resume_data"], 
                payload["mode"], 
                payload["page_count"]
            )
        elif job.type == "upload":
            await execute_upload_job_logic(
                db, 
                job.id, 
                job.user_id, 
                payload["file_id"], 
                payload["filename"], 
                payload["temp_path"], 
                payload["ext"]
            )
    except Exception as e:
        print(f"Error processing job {job_id}: {e}")
    finally:
        db.close()

def cleanup_old_resumes():
    resumes_dir = os.path.join(settings.DATA_DIR, "resumes")
    if not os.path.exists(resumes_dir):
        return
        
    now = datetime.utcnow()
    # Check all files recursively
    for root, dirs, files in os.walk(resumes_dir):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                # Get file modification time
                mtime = datetime.utcfromtimestamp(os.path.getmtime(file_path))
                # If older than 2 minutes, delete it
                if now - mtime > timedelta(minutes=2):
                    os.remove(file_path)
                    print(f"Cleanup: Deleted old tailored resume {file_path}")
            except Exception as e:
                print(f"Error cleaning up old resume file {file_path}: {e}")
                
        # Remove empty directories
        for dir in dirs:
            dir_path = os.path.join(root, dir)
            try:
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    print(f"Cleanup: Removed empty company directory {dir_path}")
            except Exception as e:
                pass

async def queue_worker_loop():
    print("Queue Worker Loop started...")
    from services.redis_service import redis_client, pop_job_from_redis
    
    # We will run cleanup every 30 seconds
    last_cleanup = datetime.utcnow()
    
    while True:
        try:
            # Run cleanup checks periodically
            if (datetime.utcnow() - last_cleanup).total_seconds() > 30:
                cleanup_old_resumes()
                last_cleanup = datetime.utcnow()

            db = SessionLocal()
            try:
                # 1. Clean up stale jobs (older than 2 minutes in processing status)
                stale_threshold = datetime.utcnow() - timedelta(minutes=2)
                stale_jobs = db.query(QueueJob).filter(
                    QueueJob.status == "processing",
                    QueueJob.updated_at < stale_threshold
                ).all()
                for job in stale_jobs:
                    job.status = "failed"
                    job.result = json.dumps({"error": "Job processing timed out."})
                    job.updated_at = datetime.utcnow()
                    print(f"Cleaned up stale/dead job {job.id}")
                if stale_jobs:
                    db.commit()
                
                # 2. Check current concurrent processing jobs
                active_count = db.query(QueueJob).filter(QueueJob.status == "processing").count()
                max_concurrent = settings.MAX_CONCURRENT_REQUESTS
                
                if active_count >= max_concurrent:
                    # Capacity full, sleep and loop
                    await asyncio.sleep(1)
                    continue
                
                # 3. Pull next job ID (Redis BLPOP if available, database query otherwise)
                job_id = None
                if redis_client is not None:
                    # We run blocking blpop in a separate thread so it doesn't block the main event loop
                    job_id = await asyncio.to_thread(pop_job_from_redis, 1)
                    
                if job_id:
                    # Verify job exists and is still queued in DB
                    job = db.query(QueueJob).filter(QueueJob.id == job_id, QueueJob.status == "queued").first()
                    if job:
                        job.status = "processing"
                        job.updated_at = datetime.utcnow()
                        db.commit()
                        print(f"Worker picked up job {job.id} (via Redis) (type: {job.type})")
                        asyncio.create_task(process_job(job.id))
                else:
                    # Fallback database polling (if Redis down or empty)
                    if redis_client is None:
                        await asyncio.sleep(1)
                        job = db.query(QueueJob).filter(QueueJob.status == "queued").order_by(QueueJob.created_at.asc()).first()
                        if job:
                            job.status = "processing"
                            job.updated_at = datetime.utcnow()
                            db.commit()
                            print(f"Worker picked up job {job.id} (via SQL poll) (type: {job.type})")
                            asyncio.create_task(process_job(job.id))
                    else:
                        # Redis enabled but BLPOP timed out; throttle slightly
                        await asyncio.sleep(0.1)
            finally:
                db.close()
                
        except Exception as e:
            print(f"Exception in queue worker loop: {e}")
            traceback.print_exc()
            await asyncio.sleep(1)
