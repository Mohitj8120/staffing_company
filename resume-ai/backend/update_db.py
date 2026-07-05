import sqlite3

def run_migration():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    # Check current columns in users table
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    new_cols = {
        "opt_strategy": "TEXT DEFAULT 'Advanced ATS tailoring (STAR Achievement focus)'",
        "default_tone": "TEXT DEFAULT 'Professional Executive (Standard Silicon Valley SDE/PM)'",
        "preserve_grades": "BOOLEAN DEFAULT 1",
        "auto_shorten": "BOOLEAN DEFAULT 1"
    }
    
    for col_name, col_type in new_cols.items():
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name} to users table.")
            
    conn.commit()
    conn.close()

if __name__ == '__main__':
    run_migration()
