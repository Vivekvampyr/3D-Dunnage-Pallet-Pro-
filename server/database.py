import os
import json
import threading

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.json")
db_lock = threading.Lock()

def read_db():
    if not os.path.exists(DB_FILE):
        return {"users": [], "inquiries": []}
    with db_lock:
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading database: {e}")
            return {"users": [], "inquiries": []}

def write_db(data):
    with db_lock:
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error writing database: {e}")
            raise e
