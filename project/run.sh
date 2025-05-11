#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_database.py
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start the frontend server
echo "Starting frontend server..."
cd ..
npx expo start

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT 