#!/usr/bin/env python
"""Setup script for initializing the backend."""
import os
import subprocess
import sys

def run_command(command):
    """Run a shell command and print output."""
    print(f"Running: {command}")
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Command failed with error: {e}")
        if "migrate" in command:
            print("\nMigration failed. Trying makemigrations first...")
            run_command("python manage.py makemigrations")
            print("\nNow trying migrate again...")
            run_command("python manage.py migrate")

def create_dirs():
    """Create necessary directories if they don't exist."""
    dirs = ['media', 'media/plant_disease_images', 'models']
    for directory in dirs:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")

def create_init_files():
    """Create __init__.py files in all app directories."""
    app_dirs = ['api', 'crop_prediction', 'pest_recognition', 'users', 'farm_help']
    for app in app_dirs:
        init_path = os.path.join(app, '__init__.py')
        migrations_dir = os.path.join(app, 'migrations')
        
        # Create app __init__.py
        if not os.path.exists(init_path):
            with open(init_path, 'w') as f:
                f.write('# This file is intentionally left empty to make Python treat the directory as a package.')
            print(f"Created {init_path}")
            
        # Create migrations directory and __init__.py if needed
        if not os.path.exists(migrations_dir):
            os.makedirs(migrations_dir)
            print(f"Created directory: {migrations_dir}")
            
        migrations_init = os.path.join(migrations_dir, '__init__.py')
        if not os.path.exists(migrations_init):
            with open(migrations_init, 'w') as f:
                f.write('# This file is intentionally left empty to make Python treat the directory as a package.')
            print(f"Created {migrations_init}")

def main():
    """Main setup function."""
    print("Starting backend setup...")
    
    # Create virtual environment
    run_command("python -m venv venv")
    
    # Activate virtual environment
    if sys.platform == 'win32':
        run_command(".\\venv\\Scripts\\activate")
        pip_cmd = ".\\venv\\Scripts\\pip"
    else:
        run_command("source venv/bin/activate")
        pip_cmd = "./venv/bin/pip"
    
    # Install requirements
    run_command(f"{pip_cmd} install -r requirements.txt")
    
    # Create necessary directories
    create_dirs()
    
    # Create __init__.py files
    create_init_files()
    
    # Run migrations
    run_command("python manage.py makemigrations")
    run_command("python manage.py migrate")
    
    # Create superuser
    print("\nLet's create a superuser for admin access:")
    run_command("python manage.py createsuperuser")
    
    print("\nSetup complete! You can now run the server with:")
    print("python manage.py runserver")

if __name__ == "__main__":
    main()
