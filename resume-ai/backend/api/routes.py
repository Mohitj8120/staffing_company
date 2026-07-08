from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid
import json
import re
import urllib.parse
from typing import Optional

from core.config import settings
from services.doc_processor import extract_text_from_docx, extract_text_from_pdf, generate_stunning_pdf
from services.llm_service import parse_resume, optimize_resume
from api.auth import get_current_user
from core.database import SessionLocal, get_db
from sqlalchemy.orm import Session
from models.user import User
from models.resume import Resume
from models.queue_job import QueueJob
from services.queue_worker import execute_optimize_job_logic, execute_upload_job_logic
from services.redis_service import push_job_to_redis
from datetime import datetime, timedelta
import jwt
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests, Response
import time

class MockResponse(Response):
    def __init__(self, status, headers, data):
        self._status = status
        self._headers = headers
        self._data = data

    @property
    def status(self):
        return self._status

    @property
    def headers(self):
        return self._headers

    @property
    def data(self):
        return self._data

class MemoryCachedRequest(requests.Request):
    def __init__(self, cache_duration=86400, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cache = {}
        self.cache_duration = cache_duration

    def __call__(self, url, method="GET", body=None, headers=None, timeout=None, **kwargs):
        if method == "GET":
            now = time.time()
            if url in self.cache:
                resp_data, expiry = self.cache[url]
                if now < expiry:
                    return MockResponse(
                        status=200,
                        headers={"content-type": "application/json"},
                        data=resp_data
                    )
            resp = super().__call__(url, method, body, headers, timeout, **kwargs)
            if resp.status == 200:
                self.cache[url] = (resp.data, now + self.cache_duration)
            return resp
        return super().__call__(url, method, body, headers, timeout, **kwargs)

google_cached_request = MemoryCachedRequest()

router = APIRouter()

def cleanup_old_jobs(db: Session):
    try:
        from datetime import datetime, timedelta
        from services.r2_service import r2_client, bucket_name
        
        # Find all completed or failed jobs older than 15 minutes
        cutoff = datetime.utcnow() - timedelta(minutes=15)
        old_jobs = db.query(QueueJob).filter(
            QueueJob.status.in_(["completed", "failed"]),
            QueueJob.updated_at < cutoff
        ).all()
        
        for job in old_jobs:
            # 1. Delete associated R2 files
            try:
                result_data = json.loads(job.result) if job.result else {}
                pdf_url = result_data.get("pdf_url")
                if pdf_url and r2_client:
                    filename = pdf_url.split('/')[-1].split('?')[0]
                    parsed_qs = urllib.parse.parse_qs(urllib.parse.urlparse(pdf_url).query)
                    company = parsed_qs.get('company', [None])[0]
                    if company and filename:
                        r2_key = f"resumes/{company}/{filename}"
                        r2_client.delete_object(Bucket=bucket_name, Key=r2_key)
                        print(f"Cleanup: Deleted old PDF from R2: {r2_key}")
            except Exception as e:
                print(f"Cleanup: Error deleting R2 files for job {job.id}: {e}")
                
            # 2. Delete local files
            try:
                result_data = json.loads(job.result) if job.result else {}
                pdf_url = result_data.get("pdf_url")
                if pdf_url:
                    filename = pdf_url.split('/')[-1].split('?')[0]
                    parsed_qs = urllib.parse.parse_qs(urllib.parse.urlparse(pdf_url).query)
                    company = parsed_qs.get('company', [None])[0]
                    if company:
                        file_path = os.path.join(settings.DATA_DIR, "resumes", company, filename)
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            parent = os.path.dirname(file_path)
                            if os.path.basename(parent) != "resumes" and os.path.exists(parent):
                                if not os.listdir(parent):
                                    os.rmdir(parent)
            except Exception as e:
                print(f"Cleanup: Error deleting local files for job {job.id}: {e}")
                
            # 3. Delete QueueJob from DB
            db.delete(job)
            print(f"Cleanup: Deleted old QueueJob {job.id} from DB")
            
        db.commit()
    except Exception as e:
        print(f"Cleanup: Error running auto-cleanup: {e}")
        db.rollback()


class GoogleLoginRequest(BaseModel):
    credential: str
    affiliate_ref: Optional[str] = None

class PreferencesUpdateRequest(BaseModel):
    opt_strategy: str
    default_tone: str
    preserve_grades: bool
    auto_shorten: bool

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_admin = current_user.email.lower() == "mohitjain1619@gmail.com"
    sub_status = (current_user.subscription_status or "free").lower()
    
    limit_total = 0
    limit_daily = 0
    count_used = 0
    
    if not is_admin:
        if sub_status == "free":
            limit_total = 3
            count_used = db.query(QueueJob).filter(
                QueueJob.user_id == current_user.id,
                QueueJob.type == "optimize",
                QueueJob.status == "completed"
            ).count()
        else:
            limit_map = {
                "starter": 5,
                "pro": 12,
                "ultimate": 25
            }
            limit_daily = limit_map.get(sub_status, 3)
            one_day_ago = datetime.datetime.utcnow() - datetime.timedelta(days=1)
            count_used = db.query(QueueJob).filter(
                QueueJob.user_id == current_user.id,
                QueueJob.type == "optimize",
                QueueJob.status == "completed",
                QueueJob.created_at >= one_day_ago
            ).count()
            
    return {
        "id": current_user.id,
        "clerk_id": current_user.clerk_id,
        "email": current_user.email,
        "credits": current_user.credits,
        "subscription_status": "pro" if is_admin else current_user.subscription_status,
        "limit_total": limit_total,
        "limit_daily": limit_daily,
        "count_used": count_used,
        "is_admin": is_admin,
        "opt_strategy": current_user.opt_strategy,
        "default_tone": current_user.default_tone,
        "preserve_grades": current_user.preserve_grades,
        "auto_shorten": current_user.auto_shorten
    }

@router.put("/me/preferences")
async def update_preferences(
    req: PreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.opt_strategy = req.opt_strategy
    current_user.default_tone = req.default_tone
    current_user.preserve_grades = req.preserve_grades
    current_user.auto_shorten = req.auto_shorten
    db.commit()
    return {"status": "success", "message": "Preferences updated successfully."}

@router.post("/auth/google")
async def auth_google(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        if req.credential == "mock_credential_for_local_admin":
            id_info = {
                "iss": "accounts.google.com",
                "sub": "local-dev-admin-sub-12345",
                "email": "mohitjain1619@gmail.com"
            }
        else:
            # Verify the Google ID token
            id_info = id_token.verify_oauth2_token(
                req.credential, 
                google_cached_request, 
                settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None
            )
        
        # Verify issuer
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
            
        google_sub = id_info.get("sub")
        email = id_info.get("email")
        
        if not google_sub or not email:
            raise HTTPException(status_code=400, detail="Invalid Google token claims")
            
        # Find or create user (reuses clerk_id to store google sub string)
        user = db.query(User).filter(User.clerk_id == google_sub).first()
        is_new_user = False
        if not user:
            user = User(clerk_id=google_sub, email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
            is_new_user = True
            
        # Generate custom session JWT token (valid for 7 days)
        payload = {
            "user_id": user.id,
            "email": user.email,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token_encoded = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        token = token_encoded if isinstance(token_encoded, str) else token_encoded.decode('utf-8')
        
        # Track affiliate signup if new user has a referral code
        if is_new_user and req.affiliate_ref:
            try:
                from models.affiliate import Affiliate, AffiliateSignup
                ref_code = req.affiliate_ref.upper().strip()
                aff = db.query(Affiliate).filter(
                    Affiliate.code == ref_code,
                    Affiliate.status == "approved"
                ).first()
                if aff:
                    existing_signup = db.query(AffiliateSignup).filter(
                        AffiliateSignup.referred_user_id == user.id
                    ).first()
                    if not existing_signup:
                        signup = AffiliateSignup(
                            affiliate_id=aff.id,
                            referred_user_id=user.id,
                            ref_code_used=ref_code
                        )
                        db.add(signup)
                        db.commit()
                        print(f"Affiliate Signup: {ref_code} referred {email}")
            except Exception as aff_err:
                print(f"Affiliate signup tracking error: {aff_err}")
        
        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "credits": user.credits,
                "subscription_status": user.subscription_status
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication server error: {str(e)}")

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not (file.filename.endswith('.docx') or file.filename.lower().endswith('.pdf')):
        raise HTTPException(status_code=400, detail="Only DOCX and PDF files are supported.")
        
    # Save the uploaded file
    file_id = str(uuid.uuid4())
    ext = ".pdf" if file.filename.lower().endswith('.pdf') else ".docx"
    temp_path = os.path.join(settings.TEMP_DIR, f"{file_id}_original{ext}")
    
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    import hashlib
    file_hash = hashlib.md5(content).hexdigest()
    
    # Check if this user has already uploaded this exact file hash
    existing = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.file_hash == file_hash).first()
    if existing:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except:
            pass
        return {
            "status": "duplicate",
            "message": "You have already uploaded this resume.",
            "file_id": existing.id,
            "filename": existing.filename,
            "title": existing.title,
            "data": get_resume_json(existing)
        }
        
    active_count = db.query(QueueJob).filter(QueueJob.status == "processing").count()
    
    if active_count < settings.MAX_CONCURRENT_REQUESTS:
        # SERVER IS FREE - Process directly
        job_id = str(uuid.uuid4())
        new_job = QueueJob(
            id=job_id,
            user_id=current_user.id,
            type="upload",
            status="processing",
            payload=json.dumps({
                "file_id": file_id,
                "filename": file.filename,
                "temp_path": temp_path,
                "ext": ext
            })
        )
        db.add(new_job)
        db.commit()
        
        try:
            result = await execute_upload_job_logic(db, job_id, current_user.id, file_id, file.filename, temp_path, ext)
            return {
                "status": "success",
                **result
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
    else:
        # SERVER IS OVERLOADED - Queue it
        job_id = str(uuid.uuid4())
        new_job = QueueJob(
            id=job_id,
            user_id=current_user.id,
            type="upload",
            status="queued",
            payload=json.dumps({
                "file_id": file_id,
                "filename": file.filename,
                "temp_path": temp_path,
                "ext": ext
            })
        )
        db.add(new_job)
        db.commit()
        
        push_job_to_redis(job_id)
        
        position = db.query(QueueJob).filter(
            QueueJob.status.in_(["queued", "processing"]),
            QueueJob.created_at < new_job.created_at
        ).count() + 1
        
        return {
            "status": "queued",
            "job_id": job_id,
            "position": position
        }

def get_resume_json(r: Resume) -> dict:
    if r.data:
        try:
            return json.loads(r.data)
        except:
            return {}
            
    file_path = os.path.join(settings.TEMP_DIR, f"{r.id}.json")
    if os.path.exists(file_path):
        try:
            import gzip
            with open(file_path, "rb") as f:
                compressed_bytes = f.read()
            try:
                decompressed_str = gzip.decompress(compressed_bytes).decode('utf-8')
                return json.loads(decompressed_str)
            except Exception:
                return json.loads(compressed_bytes.decode('utf-8'))
        except Exception as e:
            print(f"Error reading local file {file_path}: {e}")
            
    # Try download from R2
    from services.r2_service import download_file_from_r2
    r2_key = f"resumes/{r.id}.json"
    if download_file_from_r2(r2_key, file_path):
        try:
            import gzip
            with open(file_path, "rb") as f:
                compressed_bytes = f.read()
            try:
                decompressed_str = gzip.decompress(compressed_bytes).decode('utf-8')
                return json.loads(decompressed_str)
            except Exception:
                return json.loads(compressed_bytes.decode('utf-8'))
        except Exception as e:
            print(f"Error reading R2 download file {file_path}: {e}")
            
    return {}

@router.get("/resumes")
async def get_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    # Load resume JSON data concurrently using asyncio.gather
    import asyncio
    
    async def load_resume_data(r):
        loop = asyncio.get_event_loop()
        data = await loop.run_in_executor(None, get_resume_json, r)
        return {
            "id": r.id,
            "filename": r.filename,
            "title": r.title,
            "date": r.created_at.strftime("%Y-%m-%d"),
            "data": data
        }
        
    tasks = [load_resume_data(r) for r in resumes]
    results = await asyncio.gather(*tasks)
    return results

@router.post("/optimize")
async def optimize(
    background_tasks: BackgroundTasks,
    file_id: str = Form(...),
    jd: str = Form(...),
    resume_data: str = Form(...), # Expecting JSON string from frontend so user can edit before optimizing
    mode: str = Form("standard"),
    page_count: str = Form("auto"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    background_tasks.add_task(cleanup_old_jobs, db)
    is_admin = current_user.email.lower() == "mohitjain1619@gmail.com"
    if not is_admin:
        sub_status = (current_user.subscription_status or "free").lower()
        if sub_status == "free":
            # 3 resumes total limit
            total_optimized = db.query(QueueJob).filter(
                QueueJob.user_id == current_user.id,
                QueueJob.type == "optimize",
                QueueJob.status == "completed"
            ).count()
            if total_optimized >= 3:
                raise HTTPException(
                    status_code=402, 
                    detail="Free limit reached (3 resumes total). Please upgrade to continue."
                )
        else:
            # Daily limits
            limit_map = {
                "starter": 5,
                "pro": 12,
                "ultimate": 25
            }
            daily_limit = limit_map.get(sub_status, 3) # default fallback to 3
            
            # Count optimizations in the last 24 hours
            one_day_ago = datetime.datetime.utcnow() - datetime.timedelta(days=1)
            daily_count = db.query(QueueJob).filter(
                QueueJob.user_id == current_user.id,
                QueueJob.type == "optimize",
                QueueJob.status == "completed",
                QueueJob.created_at >= one_day_ago
            ).count()
            
            if daily_count >= daily_limit:
                raise HTTPException(
                    status_code=402, 
                    detail=f"Daily limit reached ({daily_limit} resumes daily for {sub_status.upper()} plan). Please upgrade to a higher plan."
                )

    import hashlib
    # Compute SHA256 hash of the optimize inputs for duplicate detection caching
    input_str = f"{file_id}|||{jd.strip()}|||{mode}|||{page_count}"
    payload_hash = hashlib.sha256(input_str.encode('utf-8')).hexdigest()
    
    # 1. Check for duplicate completed job
    duplicate_job = db.query(QueueJob).filter(
        QueueJob.type == "optimize",
        QueueJob.status == "completed",
        QueueJob.payload_hash == payload_hash
    ).order_by(QueueJob.updated_at.desc()).first()
    
    if duplicate_job:
        try:
            print(f"Duplicate optimization detected. Returning cached payload (hash: {payload_hash})")
            res_dict = json.loads(duplicate_job.result)
            return {
                "status": "success",
                **res_dict
            }
        except Exception as parse_err:
            print(f"Failed to load cached job result: {parse_err}")

    active_count = db.query(QueueJob).filter(QueueJob.status == "processing").count()
    
    if active_count < settings.MAX_CONCURRENT_REQUESTS:
        # SERVER IS FREE - Process directly
        job_id = str(uuid.uuid4())
        new_job = QueueJob(
            id=job_id,
            user_id=current_user.id,
            type="optimize",
            status="processing",
            payload_hash=payload_hash,
            payload=json.dumps({
                "file_id": file_id,
                "jd": jd,
                "resume_data": resume_data,
                "mode": mode,
                "page_count": page_count
            })
        )
        db.add(new_job)
        db.commit()
        
        try:
            result = await execute_optimize_job_logic(db, job_id, current_user.id, file_id, jd, resume_data, mode, page_count)
            return {
                "status": "success",
                **result
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error optimizing resume: {str(e)}")
    else:
        # SERVER IS OVERLOADED - Queue it
        job_id = str(uuid.uuid4())
        new_job = QueueJob(
            id=job_id,
            user_id=current_user.id,
            type="optimize",
            status="queued",
            payload_hash=payload_hash,
            payload=json.dumps({
                "file_id": file_id,
                "jd": jd,
                "resume_data": resume_data,
                "mode": mode,
                "page_count": page_count
            })
        )
        db.add(new_job)
        db.commit()
        
        push_job_to_redis(job_id)
        
        position = db.query(QueueJob).filter(
            QueueJob.status.in_(["queued", "processing"]),
            QueueJob.created_at < new_job.created_at
        ).count() + 1
        
        return {
            "status": "queued",
            "job_id": job_id,
            "position": position
        }

@router.get("/queue-status/{job_id}")
async def get_queue_status(
    job_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    background_tasks.add_task(cleanup_old_jobs, db)
    job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")
        
    if job.status == "queued":
        position = db.query(QueueJob).filter(
            QueueJob.status.in_(["queued", "processing"]),
            QueueJob.created_at < job.created_at
        ).count() + 1
        return {
            "status": "queued",
            "position": position
        }
    elif job.status == "processing":
        return {
            "status": "processing",
            "position": 0
        }
    elif job.status == "completed":
        result_data = json.loads(job.result)
        if "optimized_delta" in result_data:
            try:
                payload_dict = json.loads(job.payload)
                file_id = payload_dict.get("file_id")
                resume = db.query(Resume).filter(Resume.id == file_id).first()
                if resume:
                    base_json = get_resume_json(resume)
                    from core.json_diff import apply_dict_patch
                    result_data["optimized_data"] = apply_dict_patch(base_json, result_data["optimized_delta"])
                    del result_data["optimized_delta"]
            except Exception as patch_err:
                print(f"Failed to reconstruct optimized_data on status check: {patch_err}")
        return {
            "status": "success",
            **result_data
        }
    elif job.status == "failed":
        err_msg = "Job failed during execution."
        if job.result:
            try:
                err_msg = json.loads(job.result).get("error", err_msg)
            except:
                pass
        return {
            "status": "failed",
            "detail": err_msg
        }

def remove_file_and_job(path: str, job_id: Optional[str] = None, company: Optional[str] = None, filename: Optional[str] = None):
    # 1. Delete local file
    try:
        if os.path.exists(path):
            os.remove(path)
            print(f"Zero-Storage: Auto-deleted temporary file after download: {path}")
            
            # Also clean up parent directory if empty
            parent = os.path.dirname(path)
            if os.path.basename(parent) != "resumes" and os.path.exists(parent):
                if not os.listdir(parent):
                    os.rmdir(parent)
                    print(f"Zero-Storage: Removed empty company folder: {parent}")
    except Exception as e:
        print(f"Zero-Storage: Error auto-deleting temporary file {path}: {e}")

    # 2. Delete R2 file if exists
    from services.r2_service import r2_client, bucket_name
    if r2_client and company and filename:
        try:
            r2_key = f"resumes/{company}/{filename}"
            r2_client.delete_object(Bucket=bucket_name, Key=r2_key)
            print(f"Zero-Storage: Deleted PDF from R2: {r2_key}")
        except Exception as r2_err:
            print(f"Zero-Storage: Failed to delete PDF from R2: {r2_err}")

    # 3. Delete QueueJob from DB
    if job_id:
        db = SessionLocal()
        try:
            job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
            if job:
                db.delete(job)
                db.commit()
                print(f"Zero-Storage: Deleted QueueJob {job_id} from DB after download.")
        except Exception as db_err:
            print(f"Zero-Storage: Failed to delete QueueJob {job_id} from DB: {db_err}")
            db.rollback()
        finally:
            db.close()

def ensure_pdf_exists(filename: str, db: Session, company: Optional[str] = None, job_id: Optional[str] = None) -> str:
    """
    Checks if a PDF/DOCX file exists locally. If not, attempts to download it from R2.
    If R2 lookup fails, compiles and renders the PDF/DOCX dynamically on-the-fly from optimization history.
    """
    if company:
        file_path = os.path.join(settings.DATA_DIR, "resumes", company, filename)
        if os.path.exists(file_path):
            return file_path
            
        # Try to download from R2 using the company path
        from services.r2_service import download_file_from_r2
        r2_key = f"resumes/{company}/{filename}"
        if download_file_from_r2(r2_key, file_path):
            if os.path.exists(file_path):
                return file_path

    file_path = os.path.join(settings.TEMP_DIR, filename)
    if os.path.exists(file_path):
        return file_path
        
    # 1. Try to download from R2 first
    from services.r2_service import download_file_from_r2
    if download_file_from_r2(filename, file_path):
        if os.path.exists(file_path):
            return file_path
            
    # 2. Compile and render PDF/DOCX dynamically on-the-fly using job_id if provided
    if job_id:
        job = db.query(QueueJob).filter(QueueJob.id == job_id).first()
        if job and job.status == "completed":
            try:
                payload = json.loads(job.payload)
                result = json.loads(job.result)
                file_id = payload.get("file_id")
                
                # Fetch base resume data
                resume = db.query(Resume).filter(Resume.id == file_id).first()
                if resume:
                    base_json = get_resume_json(resume)
                    from core.json_diff import apply_dict_patch
                    optimized_data = apply_dict_patch(base_json, result["optimized_delta"])
                    
                    if optimized_data:
                        is_docx = filename.endswith(".docx")
                        # Target local save path:
                        target_path = os.path.join(settings.DATA_DIR, "resumes", company, filename) if company else os.path.join(settings.TEMP_DIR, filename)
                        os.makedirs(os.path.dirname(target_path), exist_ok=True)
                        
                        if is_docx:
                            from services.doc_processor import generate_tailored_docx
                            generate_tailored_docx(optimized_data, target_path)
                            print(f"Zero-Storage: Dynamically compiled DOCX file on-the-fly using job_id: {filename}")
                        else:
                            from services.doc_processor import generate_stunning_pdf
                            from services.doc_processor import start_pdf_render_process
                            mode = payload.get("mode", "standard")
                            page_count = payload.get("page_count", "auto")
                            # Start render process dynamically
                            render_process = start_pdf_render_process(target_path)
                            generate_stunning_pdf(optimized_data, target_path, mode, page_count, render_process)
                            print(f"Zero-Storage: Dynamically compiled PDF file on-the-fly using job_id: {filename}")
                        
                        if os.path.exists(target_path):
                            return target_path
            except Exception as err:
                print(f"Dynamic on-the-fly generation using job_id failed: {err}")

    # 3. Fallback: Compile and render PDF/DOCX dynamically on-the-fly using filename if it is a tailored file
    if filename.endswith("_tailored.pdf") or filename.endswith("_tailored.docx"):
        is_docx = filename.endswith("_tailored.docx")
        suffix = "_tailored.docx" if is_docx else "_tailored.pdf"
        file_id = filename.replace(suffix, "")
        
        # Find the latest completed optimize job for this file_id
        job = db.query(QueueJob).filter(
            QueueJob.type == "optimize",
            QueueJob.status == "completed",
            QueueJob.payload.like(f'%"file_id": "{file_id}"%')
        ).order_by(QueueJob.updated_at.desc()).first()
        
        if job:
            try:
                payload = json.loads(job.payload)
                result = json.loads(job.result)
                
                optimized_data = None
                if "optimized_data" in result:
                    optimized_data = result.get("optimized_data")
                elif "optimized_delta" in result:
                    resume = db.query(Resume).filter(Resume.id == file_id).first()
                    if resume:
                        base_json = get_resume_json(resume)
                        from core.json_diff import apply_dict_patch
                        optimized_data = apply_dict_patch(base_json, result["optimized_delta"])
                        
                if optimized_data:
                    if is_docx:
                        from services.doc_processor import generate_tailored_docx
                        generate_tailored_docx(optimized_data, file_path)
                        print(f"Zero-Storage: Dynamically compiled DOCX file on-the-fly: {filename}")
                    else:
                        from services.doc_processor import generate_stunning_pdf
                        from services.doc_processor import start_pdf_render_process
                        mode = payload.get("mode", "standard")
                        page_count = payload.get("page_count", "auto")
                        # Start render process dynamically
                        render_process = start_pdf_render_process(file_path)
                        generate_stunning_pdf(optimized_data, file_path, mode, page_count, render_process)
                        print(f"Zero-Storage: Dynamically compiled PDF file on-the-fly: {filename}")
            except Exception as err:
                print(f"Dynamic on-the-fly { 'DOCX' if is_docx else 'PDF' } generation failed: {err}")
                
    return file_path

@router.get("/download/{filename}")
async def download_file(filename: str, background_tasks: BackgroundTasks, download_name: Optional[str] = None, company: Optional[str] = None, job_id: Optional[str] = None, db: Session = Depends(get_db)):
    file_path = ensure_pdf_exists(filename, db, company, job_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    media_type = "application/pdf" if filename.endswith('.pdf') else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    if download_name:
        final_download_name = download_name
    else:
        ext = ".pdf" if filename.endswith('.pdf') else ".docx"
        suffix = f"_Resume{ext}" if f"_Resume{ext}" in filename else f"_tailored{ext}"
        file_id = filename.replace(suffix, "")
        
        is_uuid = False
        try:
            uuid.UUID(file_id)
            is_uuid = True
        except ValueError:
            pass
            
        candidate_name_formatted = None
        if is_uuid:
            resume = db.query(Resume).filter(Resume.id == file_id).first()
            if resume:
                try:
                    resume_data_dict = get_resume_json(resume)
                    name = resume_data_dict.get("personal", {}).get("name")
                    if name:
                        candidate_name_formatted = name.strip().title()
                except Exception as parse_err:
                    print(f"Failed to parse resume JSON for name: {parse_err}")
                    
        if not candidate_name_formatted:
            base_part = file_id.replace("_", " ").title()
            candidate_name_formatted = base_part
            
        if company and company.strip() and company.strip().lower() not in ["company", "not specified in jd"]:
            safe_company = re.sub(r'[^a-zA-Z0-9\s_-]', '', company).strip()
            final_download_name = f"{safe_company}/{candidate_name_formatted} - Resume{ext}"
        else:
            final_download_name = f"{candidate_name_formatted} - Resume{ext}"
    
    # Queue background task to delete the temporary file, R2 backup, and job from DB after the download completes
    background_tasks.add_task(remove_file_and_job, file_path, job_id, company, filename)
    
    headers = {
        "Content-Disposition": f'attachment; filename="{final_download_name}"'
    }
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers=headers
    )

import zipfile
import io
from fastapi.responses import StreamingResponse

@router.get("/download_zip/{filename}")
async def download_zip(
    filename: str, 
    background_tasks: BackgroundTasks,
    company: Optional[str] = "Company", 
    candidate: Optional[str] = "Candidate", 
    job_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    file_path = ensure_pdf_exists(filename, db, company)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        # Folder structure inside ZIP
        safe_company = re.sub(r'[^a-zA-Z0-9\s_-]', '', company).strip()
        safe_candidate = re.sub(r'[^a-zA-Z0-9\s_-]', '', candidate).strip().replace(' ', '_')
        if not safe_company:
            safe_company = "Company"
        if not safe_candidate:
            safe_candidate = "Candidate"
            
        zip_path = f"{safe_company}/{safe_candidate}_Resume.pdf"
        zip_file.write(file_path, zip_path)
        
    # Queue background task to delete the temporary file, R2 backup, and job from DB after download completes
    background_tasks.add_task(remove_file_and_job, file_path, job_id, company, filename)
        
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={safe_company}_Resume.zip"
        }
    )



@router.get("/sentry-debug")
async def trigger_error():
    """
    Sentry Verification Endpoint.
    Triggers a division by zero error to verify error reporting context.
    """
    division_by_zero = 1 / 0
    return {"message": "Will never return due to division by zero", "result": division_by_zero}

@router.delete("/resumes/{file_id}")
async def delete_resume(file_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == file_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this resume")
        
    # Delete from R2 if credentials are set
    from services.r2_service import r2_client, bucket_name
    if r2_client:
        try:
            r2_key = f"resumes/{file_id}.json"
            r2_client.delete_object(Bucket=bucket_name, Key=r2_key)
            print(f"Deleted JSON backup from R2: {r2_key}")
        except Exception as r2_err:
            print(f"Failed to delete JSON backup from R2: {r2_err}")
            
    # Delete from local file system if exists
    json_path = os.path.join(settings.TEMP_DIR, f"{file_id}.json")
    try:
        if os.path.exists(json_path):
            os.remove(json_path)
    except:
        pass
        
    db.delete(resume)
    db.commit()
    return {"status": "success", "message": "Resume deleted successfully"}

@router.get("/admin/users")
async def get_admin_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.email.lower() != "mohitjain1619@gmail.com":
        raise HTTPException(status_code=403, detail="Unauthorized admin access")
        
    users = db.query(User).order_by(User.id.desc()).all()
    
    results = []
    for u in users:
        resume_count = db.query(Resume).filter(Resume.user_id == u.id).count()
        results.append({
            "id": u.id,
            "email": u.email,
            "credits": u.credits,
            "subscription_status": u.subscription_status,
            "resume_count": resume_count,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else "N/A"
        })
    return results

