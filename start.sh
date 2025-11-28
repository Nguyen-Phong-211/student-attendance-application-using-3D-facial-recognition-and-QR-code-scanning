#!/bin/bash
# start.sh

echo "Running migrations..."
python manage.py migrate

# Start backend
echo "Starting Django backend..."
uvicorn attend3d.asgi:application --reload --host 0.0.0.0 --port 8000

# Start frontend
echo "Starting React frontend..."
cd frontend
npm start -- --host 0.0.0.0