@echo off

REM Start the backend server
echo Starting backend server...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python seed_database.py
start /B uvicorn main:app --reload --port 8000

REM Start the frontend server
echo Starting frontend server...
cd ..
npx expo start

REM Cleanup on exit
taskkill /F /IM uvicorn.exe 