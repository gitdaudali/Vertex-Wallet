"""
Check users in database and their name fields.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print(f"Total users: {len(users)}")
    print("-" * 60)
    for u in users:
        name = getattr(u, 'name', None)
        print(f"User {u.id}:")
        print(f"  Email: {u.email}")
        print(f"  Name: {name}")
        print(f"  Has name attr: {hasattr(u, 'name')}")
        print(f"  Created at: {u.created_at}")
        print("-" * 60)
finally:
    db.close()

