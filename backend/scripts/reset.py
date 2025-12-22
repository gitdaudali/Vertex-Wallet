"""
Database reset script.
Drops all tables and recreates them using Alembic migrations.
"""
import sys
import os
import subprocess

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def reset_database():
    """Reset database by downgrading to base and upgrading to head."""
    print("=" * 60)
    print("Resetting database...")
    print("=" * 60 + "\n")
    
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_cmd = os.path.join(backend_dir, "venv", "Scripts", "alembic.exe")
    
    if not os.path.exists(alembic_cmd):
        print("[ERROR] Alembic not found. Make sure virtual environment is activated.")
        sys.exit(1)
    
    try:
        # Downgrade to base (remove all tables)
        print("Step 1: Downgrading database to base...")
        result = subprocess.run(
            [alembic_cmd, "downgrade", "base"],
            cwd=backend_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            # If downgrade fails (no migrations applied), that's okay
            if "Can't locate revision identified by 'base'" in result.stderr:
                print("  (No migrations to downgrade)")
            else:
                print(f"[WARNING] Downgrade output: {result.stdout}")
                print(f"[WARNING] Downgrade errors: {result.stderr}")
        
        # Upgrade to head (create all tables)
        print("\nStep 2: Upgrading database to head...")
        result = subprocess.run(
            [alembic_cmd, "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"[ERROR] Upgrade failed:")
            print(result.stdout)
            print(result.stderr)
            sys.exit(1)
        
        print(result.stdout)
        
        print("\n" + "=" * 60)
        print("Database reset completed successfully!")
        print("=" * 60)
        print("\nYou can now run: python scripts/seed.py")
        
    except Exception as e:
        print(f"\n[ERROR] Reset failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    reset_database()

