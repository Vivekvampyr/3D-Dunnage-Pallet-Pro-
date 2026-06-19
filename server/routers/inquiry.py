import time
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from database import read_db, write_db
from auth import get_current_user

router = APIRouter(prefix="/api/inquiry", tags=["inquiry"])

class InquirySchema(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    company: str = ""
    phone: str = ""
    message: str = ""

@router.post("")
def submit_inquiry(inquiry_data: InquirySchema):
    name = inquiry_data.name.strip()
    email = inquiry_data.email.strip()
    company = inquiry_data.company.strip()
    phone = inquiry_data.phone.strip()
    message = inquiry_data.message.strip()

    if not name or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name and email are required fields."
        )

    db = read_db()
    
    new_inquiry = {
        "id": str(int(time.time() * 1000)),
        "name": name,
        "email": email,
        "company": company,
        "phone": phone,
        "message": message,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    if "inquiries" not in db:
        db["inquiries"] = []
    
    db["inquiries"].append(new_inquiry)
    write_db(db)

    return {"message": "Inquiry submitted successfully.", "inquiry": new_inquiry}

@router.get("")
def get_inquiries(current_user: dict = Depends(get_current_user)):
    db = read_db()
    return db.get("inquiries", [])
