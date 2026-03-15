import os
import django
import requests
from django.core.files import File
from io import BytesIO

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from portfolio.models import Project

def seed():
    if Project.objects.exists():
        print("Projects already exist. Skipping seeding.")
        return

    print("Seeding sample project...")
    
    # Sample data
    p = Project(
        title="My First Professional Project",
        description="This is a sample project managed by Django Backend. It demonstrates how easy it is to manage your work through the admin panel.",
        url="https://github.com/",
        technologies="Python, Django, SQLite, REST API"
    )

    # Download a placeholder image
    try:
        response = requests.get("https://picsum.photos/800/600")
        if response.status_code == 200:
            p.image.save('sample.jpg', File(BytesIO(response.content)), save=False)
    except Exception as e:
        print(f"Failed to download image: {e}")

    p.save()
    print("Sample project created successfully!")

if __name__ == "__main__":
    seed()
