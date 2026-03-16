import os
import sqlite3

# Parse path from DATABASE_URL env var (e.g. sqlite:////app/data/jobtrackr.db)
_db_url = os.getenv("DATABASE_URL", "sqlite:///./jobtrackr.db")
_db_path = _db_url.replace("sqlite:////", "/").replace("sqlite:///", "")

conn = sqlite3.connect(_db_path)
c = conn.cursor()

migrations = [
    # users
    "ALTER TABLE users ADD COLUMN reset_token TEXT",
    "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME",
    "ALTER TABLE users ADD COLUMN preferred_keywords TEXT DEFAULT '[]'",
    "ALTER TABLE users ADD COLUMN blacklisted_companies TEXT DEFAULT '[]'",
    # job_sources
    "ALTER TABLE job_sources ADD COLUMN last_checked DATETIME",
    "ALTER TABLE job_sources ADD COLUMN last_status TEXT",
    "ALTER TABLE job_sources ADD COLUMN failure_reason TEXT",
    # job_listings
    "ALTER TABLE job_listings ADD COLUMN is_starred BOOLEAN DEFAULT 0",
    "ALTER TABLE job_listings ADD COLUMN location TEXT",
    "ALTER TABLE job_listings ADD COLUMN salary TEXT",
    "ALTER TABLE job_listings ADD COLUMN description TEXT",
    "ALTER TABLE job_listings ADD COLUMN posted_date TEXT",
    # security hardening: refresh token support
    "ALTER TABLE users ADD COLUMN refresh_token TEXT",
    "ALTER TABLE users ADD COLUMN refresh_token_expires DATETIME",
    # default job sources: is_default flag on user sources
    "ALTER TABLE job_sources ADD COLUMN is_default BOOLEAN DEFAULT 0",
    # new table: admin-managed default job sources
    """CREATE TABLE IF NOT EXISTS default_job_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        check_frequency TEXT DEFAULT 'daily',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER REFERENCES users(id)
    )""",
    # scrape result cache — shared across all users to avoid duplicate API calls
    """CREATE TABLE IF NOT EXISTS scrape_cache (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        url        TEXT     NOT NULL,
        scraped_at DATETIME DEFAULT (datetime('now')),
        jobs_json  TEXT     NOT NULL
    )""",
    "CREATE INDEX IF NOT EXISTS ix_scrape_cache_url        ON scrape_cache (url)",
    "CREATE INDEX IF NOT EXISTS ix_scrape_cache_scraped_at ON scrape_cache (scraped_at)",
    # SMTP configuration (singleton, admin-managed)
    """CREATE TABLE IF NOT EXISTS smtp_config (
        id         INTEGER PRIMARY KEY DEFAULT 1,
        host       TEXT    NOT NULL,
        port       INTEGER DEFAULT 587,
        username   TEXT    NOT NULL,
        password   TEXT    NOT NULL,
        from_email TEXT    NOT NULL,
        from_name  TEXT    DEFAULT 'JobTrackr',
        use_tls    BOOLEAN DEFAULT 1,
        updated_at DATETIME DEFAULT (datetime('now'))
    )""",
    # Per-user email digest preferences
    """CREATE TABLE IF NOT EXISTS digest_configs (
        id        INTEGER  PRIMARY KEY AUTOINCREMENT,
        user_id   INTEGER  NOT NULL UNIQUE REFERENCES users(id),
        enabled   BOOLEAN  DEFAULT 1,
        frequency TEXT     DEFAULT 'daily',
        send_hour INTEGER  DEFAULT 8,
        last_sent DATETIME
    )""",
    # Audit trail of all outgoing emails
    """CREATE TABLE IF NOT EXISTS email_logs (
        id           INTEGER  PRIMARY KEY AUTOINCREMENT,
        to_email     TEXT     NOT NULL,
        subject      TEXT     NOT NULL,
        body_preview TEXT,
        email_type   TEXT     NOT NULL,
        status       TEXT     NOT NULL,
        error        TEXT,
        user_id      INTEGER  REFERENCES users(id),
        sent_at      DATETIME DEFAULT (datetime('now'))
    )""",
    "CREATE INDEX IF NOT EXISTS ix_email_logs_sent_at ON email_logs (sent_at)",
]

for sql in migrations:
    try:
        c.execute(sql)
        print(f"OK: {sql[:70]}")
    except Exception as e:
        print(f"SKIP ({e}): {sql[:70]}")

conn.commit()
conn.close()
print("Done")
