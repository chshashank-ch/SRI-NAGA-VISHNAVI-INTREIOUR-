import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "interiors.db"

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        specifications TEXT,
        featured INTEGER DEFAULT 0,
        price_range TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT,
        message TEXT,
        address TEXT,
        status TEXT DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)

    # Default workshop settings
    defaults = {
        "admin_pin": "admin123",
        "business_name": "Sri Naga Vaishnavi Interiors",
        "owner_name": "Master Craftsman & Workshop Owner",
        "phone_primary": "+91 83286 64428",
        "phone_secondary": "+91 83286 64428",
        "whatsapp_number": "+918328664428",
        "email": "contact@srinagavaishnavi.com",
        "address": "Opp. Main Bus Depot, Workshop Road, Industrial Area, Hyderabad / Vijayawada",
        "working_hours": "Mon - Sat: 9:00 AM - 8:30 PM | Sun: 10:00 AM - 4:00 PM",
        "experience_years": "14+",
        "completed_projects": "1,850+",
        "happy_customers": "1,500+"
    }

    for key, value in defaults.items():
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, value))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
