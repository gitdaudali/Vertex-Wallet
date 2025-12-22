"""
Reset and seed database in one command.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reset import reset_database
from seed import seed_all


def reset_and_seed():
    """Reset database and seed with fixtures."""
    print("\n" + "=" * 60)
    print("RESET AND SEED DATABASE")
    print("=" * 60 + "\n")
    
    # Reset database
    reset_database()
    
    print("\n" + "=" * 60)
    print("SEEDING DATABASE")
    print("=" * 60 + "\n")
    
    # Seed database
    seed_all()
    
    print("\n" + "=" * 60)
    print("Done! Database has been reset and seeded.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    reset_and_seed()

