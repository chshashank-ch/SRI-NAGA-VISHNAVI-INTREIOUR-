import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parent / "interiors.db"
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

cursor.execute("UPDATE settings SET value = '+918328664428' WHERE key = 'whatsapp_number'")
cursor.execute("UPDATE settings SET value = '+91 83286 64428' WHERE key = 'phone_primary'")
cursor.execute("UPDATE settings SET value = '+91 83286 64428' WHERE key = 'phone_secondary'")
conn.commit()

cursor.execute("SELECT key, value FROM settings WHERE key IN ('whatsapp_number', 'phone_primary')")
print("Updated database settings:", cursor.fetchall())
conn.close()
