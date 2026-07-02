import sqlite3
conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()
cursor.execute("UPDATE users SET email='mohitjain1619@gmail.com' WHERE email='user@example.com'")
conn.commit()
print("Updated.")
