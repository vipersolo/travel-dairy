#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Checking/Creating Master Admin account..."
# We use a tiny inline Python script to safely create the user
# without crashing if the user already exists.
python -c "
import os
import django

# Tell Django where the settings file is located before setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_diary_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
email = os.environ.get('SUPERUSER_EMAIL', 'admin@traveldiary.com')
password = os.environ.get('SUPERUSER_PASSWORD', 'admin1234')

# Check if user exists. If not, create them with the MODERATOR role.
if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password, role='MODERATOR')
    print(f'✅ Master Admin {email} created successfully!')
else:
    print(f'ℹ️ Master Admin {email} already exists. Skipping.')
"

echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 travel_diary_backend.wsgi:application