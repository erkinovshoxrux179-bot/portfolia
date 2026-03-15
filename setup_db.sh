#!/bin/bash
cd /home/shokh/Documents/portfolia
source venv/bin/activate
python manage.py makemigrations portfolio
python manage.py migrate
export DJANGO_SUPERUSER_PASSWORD=admin
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
python manage.py createsuperuser --noinput || true
