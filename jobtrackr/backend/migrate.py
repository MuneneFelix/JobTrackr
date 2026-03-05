import sqlite3

conn = sqlite3.connect('jobtrackr.db')
c = conn.cursor()

migrations = [
    "ALTER TABLE users ADD COLUMN reset_token TEXT",
    "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME",
    "ALTER TABLE users ADD COLUMN preferred_keywords TEXT DEFAULT '[]'",
    "ALTER TABLE users ADD COLUMN blacklisted_companies TEXT DEFAULT '[]'",
    "ALTER TABLE job_listings ADD COLUMN is_starred BOOLEAN DEFAULT 0",
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
