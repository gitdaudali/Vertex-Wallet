"""
Database seeding script.
Seeds the database with test data (users, etc.)
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.db import models
from app.core.security import get_password_hash
from fixtures.users import get_test_users


def seed_users(db):
    """Seed users table."""
    print("Seeding users...")
    users_data = get_test_users()
    created_count = 0
    skipped_count = 0
    
    for user_data in users_data:
        email = user_data["email"]
        password = user_data["password"]
        
        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            print(f"  - User '{email}' already exists, skipping...")
            skipped_count += 1
            continue
        
        # Create new user
        user = models.User(
            email=email,
            password_hash=get_password_hash(password)
        )
        db.add(user)
        created_count += 1
        print(f"  + Created user: {email}")
    
    db.commit()
    print(f"Users seeding complete: {created_count} created, {skipped_count} skipped\n")
    return created_count, skipped_count


def seed_all():
    """Seed all fixtures."""
    print("=" * 60)
    print("Starting database seeding...")
    print("=" * 60 + "\n")
    
    db = SessionLocal()
    try:
        # Seed users
        users_created, users_skipped = seed_users(db)
        
        print("=" * 60)
        print("Seeding Summary:")
        print("=" * 60)
        print(f"Users: {users_created} created, {users_skipped} skipped")
        print("=" * 60)
        print("\nSeeding completed successfully!")
        
        if users_created > 0 or users_skipped > 0:
            print("\nTest User Credentials:")
            print("-" * 60)
            for user_data in get_test_users():
                print(f"Email:    {user_data['email']}")
                print(f"Password: {user_data['password']}")
                print(f"Desc:     {user_data['description']}")
                print("-" * 60)
        
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()

