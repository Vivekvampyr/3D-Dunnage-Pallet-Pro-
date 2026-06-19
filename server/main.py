import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import read_db, write_db
from auth import hash_password
from routers import auth, inquiry
import time

app = FastAPI(title="Dunnage Pro API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins since we proxy and run locally
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(inquiry.router)

@app.on_event("startup")
def startup_event():
    # Seed default admin user if db has no users
    db = read_db()
    
    if "users" not in db:
        db["users"] = []
    if "inquiries" not in db:
        db["inquiries"] = []
        
    if not db["users"]:
        print("Seeding default admin user...")
        # Hashed password for "password"
        hashed = hash_password("password")
        admin_user = {
            "id": "admin-default-id",
            "email": "admin@company.com",
            "password": hashed,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        db["users"].append(admin_user)
        write_db(db)
        print("Default admin user seeded successfully (admin@company.com / password).")

@app.get("/")
def read_root():
    return {"message": "Dunnage Pro FastAPI Server is running."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
