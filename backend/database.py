import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "incidents.db"

def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_code TEXT UNIQUE NOT NULL,
        bus_id TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        confidence REAL NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT NOT NULL,
        severity INTEGER NOT NULL DEFAULT 5,
        traffic_level TEXT NOT NULL DEFAULT 'LOW',
        traffic_count INTEGER NOT NULL DEFAULT 0,
        verification_count INTEGER NOT NULL DEFAULT 1,
        priority_score REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'DETECTED'
    )
    """)
    conn.commit()
    conn.close()
