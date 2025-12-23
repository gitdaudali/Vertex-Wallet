"""
Update existing users to have default names if they are None.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    updated_count = 0
    
    for user in users:
        if not user.name or user.name.strip() == "":
            # Generate a default name from email
            email_prefix = user.email.split('@')[0]
            default_name = email_prefix.capitalize() + " User"
            
            user.name = default_name
            updated_count += 1
            print(f"Updated user {user.email}: name = '{default_name}'")
    
    if updated_count > 0:
        db.commit()
        print(f"\nUpdated {updated_count} users with default names.")
    else:
        print("\nAll users already have names.")
        
finally:
    db.close()

