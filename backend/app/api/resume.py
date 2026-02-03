from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
from typing import Dict, Any
from ..services.resume_parser import ResumeParser

router = APIRouter()
resume_parser = ResumeParser()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload and parse a resume file (PDF, DOCX, or TXT).

    Returns:
        - skills: List of identified technical skills
        - courses: List of relevant course codes
        - experience_years: Estimated years of experience
        - raw_text: Extracted text from resume
    """
    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a PDF, DOCX, or TXT file."
        )

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit."
        )

    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            tmp_file.write(contents)
            tmp_file_path = tmp_file.name

        # Parse resume
        parsed_data = await resume_parser.parse_resume(tmp_file_path, file.content_type)

        # Clean up temporary file
        os.unlink(tmp_file_path)

        return JSONResponse(content=parsed_data)

    except Exception as e:
        # Clean up on error
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse resume: {str(e)}"
        )
