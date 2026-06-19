import time
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from database import read_db, write_db
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserAuthSchema(BaseModel):
    email: str
    password: str = Field(..., min_length=3)

@router.post("/register")
def register(user_data: UserAuthSchema):
    email = user_data.email.strip().lower()
    password = user_data.password.strip()

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Please provide both email and password."
        )

    db = read_db()
    # Check duplicate
    for u in db["users"]:
        if u["email"] == email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User with this email already exists."
            )

    hashed = hash_password(password)
    new_user = {
        "id": str(int(time.time() * 1000)),
        "email": email,
        "password": hashed,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    db["users"].append(new_user)
    write_db(db)

    token = create_token({"id": new_user["id"], "email": new_user["email"]})
    return {
        "token": token,
        "user": {"id": new_user["id"], "email": new_user["email"]}
    }

@router.post("/login")
def login(user_data: UserAuthSchema):
    email = user_data.email.strip().lower()
    password = user_data.password.strip()

    db = read_db()
    user = None
    for u in db["users"]:
        if u["email"] == email:
            user = u
            break

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid credentials."
        )

    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid credentials."
        )

    token = create_token({"id": user["id"], "email": user["email"]})
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"]}
    }

@router.get("/verify")
def verify(current_user: dict = Depends(get_current_user)):
    return {"user": {"id": current_user["id"], "email": current_user["email"]}}
