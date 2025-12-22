"""
User fixtures for seeding the database.
"""
from typing import List, Dict

# Test users fixtures
TEST_USERS: List[Dict[str, str]] = [
    {
        "email": "test@example.com",
        "password": "test123456",
        "description": "Main test user"
    },
    {
        "email": "admin@example.com",
        "password": "admin123456",
        "description": "Admin test user"
    },
    {
        "email": "user@example.com",
        "password": "user123456",
        "description": "Regular user"
    }
]

def get_test_users():
    """Get list of test users."""
    return TEST_USERS

