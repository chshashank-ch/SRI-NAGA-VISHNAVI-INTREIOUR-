import os
import sys
import shutil
import uuid
from pathlib import Path
from typing import Optional, List

# Ensure backend directory is in sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from database import get_db_connection, init_db
from models import InquiryCreate, InquiryStatusUpdate, AdminLogin, SettingsUpdate
from seed_data import seed

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
FRONTEND_DIR = BASE_DIR / "frontend"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Sri Naga Vaishnavi Interiors API",
    description="Backend API for workshop portfolio, photo uploads, and customer inquiries",
    version="1.0.0"
)

# Enable CORS for seamless local and network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initialize database and seed if empty
@app.on_event("startup")
def on_startup():
    init_db()
    seed()

# Helper: verify admin PIN
def verify_admin(x_admin_pin: Optional[str] = Header(None)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'admin_pin'")
    row = cursor.fetchone()
    conn.close()
    current_pin = row["value"] if row else "admin123"

    if not x_admin_pin or x_admin_pin != current_pin:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Admin PIN")
    return True

# ----------------- PUBLIC PROJECT ENDPOINTS -----------------

@app.get("/api/projects")
def get_projects(
    category: Optional[str] = None,
    featured: Optional[int] = None,
    search: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM projects WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if featured is not None:
        query += " AND featured = ?"
        params.append(featured)

    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR specifications LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY featured DESC, id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

@app.get("/api/projects/{project_id}")
def get_project(project_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return dict(row)

@app.get("/api/categories")
def get_categories():
    categories_meta = [
        {"id": "all", "label": "All Work", "icon": "fa-th-large"},
        {"id": "mesh_doors", "label": "Mosquito Mesh Doors", "icon": "fa-shield-alt"},
        {"id": "bathroom_doors", "label": "Waterproof Bathroom Doors", "icon": "fa-door-closed"},
        {"id": "cloth_hangers", "label": "Ceiling Cloth Hangers", "icon": "fa-tshirt"},
        {"id": "blinds", "label": "Window Blinds & Shades", "icon": "fa-sliders-h"},
        {"id": "designer_doors", "label": "Safety & Designer Doors", "icon": "fa-door-open"},
        {"id": "window_accessories", "label": "Window Accessories & Tracks", "icon": "fa-window-maximize"}
    ]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT category, COUNT(*) as count FROM projects GROUP BY category")
    counts = {row["category"]: row["count"] for row in cursor.fetchall()}
    conn.close()

    for cat in categories_meta:
        if cat["id"] == "all":
            cat["count"] = sum(counts.values())
        else:
            cat["count"] = counts.get(cat["id"], 0)

    return categories_meta

# ----------------- OWNER PHOTO UPLOAD & MANAGEMENT -----------------

@app.post("/api/projects")
async def create_project(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    specifications: str = Form(""),
    price_range: str = Form(""),
    featured: int = Form(0),
    file: Optional[UploadFile] = File(None),
    x_admin_pin: Optional[str] = Header(None)
):
    verify_admin(x_admin_pin)

    image_url = "/assets/images/mesh_door.jpg"  # default fallback

    if file and file.filename:
        ext = Path(file.filename).suffix.lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            raise HTTPException(status_code=400, detail="Only image files (.jpg, .png, .webp) allowed")
        
        filename = f"{uuid.uuid4().hex[:10]}_{file.filename.replace(' ', '_')}"
        dest = UPLOADS_DIR / filename
        with open(dest, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        image_url = f"/uploads/{filename}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO projects (title, category, description, image_url, specifications, featured, price_range)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (title, category, description, image_url, specifications, featured, price_range))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"message": "Project uploaded successfully", "id": new_id, "image_url": image_url}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, x_admin_pin: Optional[str] = Header(None)):
    verify_admin(x_admin_pin)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT image_url FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")

    image_url = row["image_url"]
    if image_url.startswith("/uploads/"):
        filename = image_url.replace("/uploads/", "")
        file_path = UPLOADS_DIR / filename
        if file_path.exists():
            try:
                os.remove(file_path)
            except Exception:
                pass

    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()

    return {"message": "Project deleted successfully"}

# ----------------- CUSTOMER INQUIRIES / LEADS -----------------

@app.post("/api/inquiries")
def create_inquiry(inquiry: InquiryCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO inquiries (name, phone, service, message, address, status)
    VALUES (?, ?, ?, ?, ?, 'New')
    """, (inquiry.name, inquiry.phone, inquiry.service, inquiry.message, inquiry.address))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "message": "Thank you! We received your request. Owner will contact you shortly.",
        "inquiry_id": new_id
    }

@app.get("/api/inquiries")
def get_inquiries(x_admin_pin: Optional[str] = Header(None)):
    verify_admin(x_admin_pin)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inquiries ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

@app.patch("/api/inquiries/{inquiry_id}")
def update_inquiry_status(
    inquiry_id: int,
    payload: InquiryStatusUpdate,
    x_admin_pin: Optional[str] = Header(None)
):
    verify_admin(x_admin_pin)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE inquiries SET status = ? WHERE id = ?", (payload.status, inquiry_id))
    conn.commit()
    conn.close()

    return {"message": "Inquiry status updated"}

@app.delete("/api/inquiries/{inquiry_id}")
def delete_inquiry(inquiry_id: int, x_admin_pin: Optional[str] = Header(None)):
    verify_admin(x_admin_pin)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inquiries WHERE id = ?", (inquiry_id,))
    conn.commit()
    conn.close()

    return {"message": "Inquiry deleted"}

# ----------------- ADMIN AUTH & SETTINGS -----------------

@app.post("/api/admin/login")
def admin_login(payload: AdminLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'admin_pin'")
    row = cursor.fetchone()
    conn.close()

    correct_pin = row["value"] if row else "admin123"
    if payload.pin == correct_pin:
        return {"authenticated": True, "token": correct_pin, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Incorrect PIN")

@app.get("/api/settings")
def get_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    settings = {row["key"]: row["value"] for row in cursor.fetchall()}
    conn.close()

    # Exclude admin PIN from public settings
    settings.pop("admin_pin", None)
    return settings

@app.put("/api/settings")
def update_settings(payload: SettingsUpdate, x_admin_pin: Optional[str] = Header(None)):
    verify_admin(x_admin_pin)

    data = payload.dict(exclude_unset=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    for k, v in data.items():
        if v is not None:
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))

    conn.commit()
    conn.close()

    return {"message": "Settings updated successfully"}

# ----------------- STATIC ASSETS & FRONTEND SERVING -----------------

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")
app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")

@app.get("/")
def serve_index():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse({"status": "Frontend not ready yet"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
