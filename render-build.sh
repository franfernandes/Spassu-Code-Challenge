#!/bin/bash
set -o errexit

pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py create_admin
