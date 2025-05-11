#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run model setup script
python scripts/setup_model.py

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload 