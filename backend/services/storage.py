import os
import uuid

from google.cloud import storage

BUCKET_NAME = os.getenv("GCS_BUCKET", "seoulmate-uploads")
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

_GCS_URL_PREFIX = f"https://storage.googleapis.com/{BUCKET_NAME}/"


def _get_bucket():
    client = storage.Client()
    return client.bucket(BUCKET_NAME)


def upload_file(file_bytes: bytes, original_name: str, content_type: str) -> str:
    """Upload file to GCS and return a GCS URL (used as identifier)."""
    ext = original_name.rsplit(".", 1)[-1] if "." in original_name else ""
    blob_name = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex

    bucket = _get_bucket()
    blob = bucket.blob(blob_name)
    blob.upload_from_string(file_bytes, content_type=content_type)

    return f"{_GCS_URL_PREFIX}{blob_name}"


def download_file(url: str) -> bytes:
    """Download file from GCS using authenticated SDK access."""
    if url.startswith(_GCS_URL_PREFIX):
        blob_name = url[len(_GCS_URL_PREFIX):]
        bucket = _get_bucket()
        return bucket.blob(blob_name).download_as_bytes()

    # Fallback for non-GCS URLs
    import httpx

    resp = httpx.get(url, timeout=30)
    resp.raise_for_status()
    return resp.content
