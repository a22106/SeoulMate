from fastapi import APIRouter, HTTPException, UploadFile

from schemas.upload import UploadResponse
from services.storage import ALLOWED_TYPES, MAX_FILE_SIZE, upload_file

router = APIRouter(prefix="/api")


@router.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile):
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Allowed: {', '.join(sorted(ALLOWED_TYPES))}",
        )

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 20MB limit")

    url = upload_file(data, file.filename or "file", content_type)

    return UploadResponse(
        file_url=url,
        mime_type=content_type,
        original_name=file.filename or "file",
    )
