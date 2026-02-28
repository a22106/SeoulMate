from pydantic import BaseModel


class UploadResponse(BaseModel):
    file_url: str
    mime_type: str
    original_name: str
