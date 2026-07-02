import os
import boto3
from botocore.config import Config
from core.config import settings

r2_client = None
bucket_name = settings.R2_BUCKET_NAME

if all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY, settings.R2_BUCKET_NAME]):
    try:
        # Cloudflare R2 requires S3-compatible configuration
        r2_client = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=Config(signature_version="s3v4")
        )
        print(f"Initialized Cloudflare R2 client for bucket: {bucket_name}")
    except Exception as e:
        print(f"Failed to initialize Cloudflare R2 client: {e}. Falling back to local storage.")
        r2_client = None

def upload_file_to_r2(local_path: str, r2_filename: str) -> str:
    """
    Uploads a local file to Cloudflare R2.
    Returns the CDN or public download URL of the uploaded file.
    If R2 is not configured, returns the local path.
    """
    if r2_client and os.path.exists(local_path):
        try:
            # Detect content type
            content_type = "application/pdf" if r2_filename.endswith(".pdf") else "application/octet-stream"
            if r2_filename.endswith(".docx"):
                content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                
            r2_client.upload_file(
                Filename=local_path,
                Bucket=bucket_name,
                Key=r2_filename,
                ExtraArgs={"ContentType": content_type}
            )
            print(f"Uploaded {local_path} to R2 as {r2_filename}")
            return get_r2_url(r2_filename)
        except Exception as e:
            print(f"R2 upload error: {e}")
            
    # Fallback to local url
    return f"/api/download/{r2_filename}"

def download_file_from_r2(r2_filename: str, local_path: str) -> bool:
    """
    Downloads a file from Cloudflare R2 to a local path.
    Returns True if successful, False otherwise.
    """
    if r2_client:
        try:
            # Ensure directories exist
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            r2_client.download_file(
                Bucket=bucket_name,
                Key=r2_filename,
                Filename=local_path
            )
            return True
        except Exception as e:
            print(f"R2 download error: {e}")
    return False

def get_r2_url(r2_filename: str) -> str:
    """
    Returns the public access URL for a file in R2.
    If custom CDN domain is configured, uses that. Otherwise, generates a signed URL.
    """
    if not r2_client:
        return f"/api/download/{r2_filename}"
        
    if settings.R2_PUBLIC_CUSTOM_DOMAIN:
        # Clean domain string
        domain = settings.R2_PUBLIC_CUSTOM_DOMAIN.rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"
        return f"{domain}/{r2_filename}"
    else:
        # Fallback to generating a presigned URL (valid for 1 hour)
        try:
            url = r2_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": bucket_name, "Key": r2_filename},
                ExpiresIn=3600
            )
            return url
        except Exception as e:
            print(f"Error generating presigned URL: {e}")
            return f"/api/download/{r2_filename}"
