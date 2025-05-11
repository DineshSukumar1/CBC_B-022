from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
import uvicorn
from models.weather import WeatherData
from models.voice import VoiceRequest
from services.crop_service import get_crops, get_crop_recommendations, router as crop_router
from services.weather_service import get_weather
from services.voice_service import process_voice_input
from services.disease_service import detect_disease, get_detection_history
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Ensure the detections directory exists
os.makedirs("data/detections", exist_ok=True)

# Mount static files for detection images
app.mount("/detections", StaticFiles(directory="data/detections"), name="detections")

# Create API router with prefix
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

@api_router.get("/weather")
async def weather_endpoint(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    try:
        weather_data = await get_weather(lat, lon)
        return weather_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in weather endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

@api_router.post("/recommendations")
async def crop_recommendations_endpoint(weather_data: WeatherData):
    try:
        lat = weather_data.latitude if hasattr(weather_data, 'latitude') else 0
        lon = weather_data.longitude if hasattr(weather_data, 'longitude') else 0
        recommendations = await get_crop_recommendations(weather_data, lat, lon)
        return recommendations
    except Exception as e:
        logger.error(f"Error in crop recommendations endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get crop recommendations")

@api_router.post("/voice")
async def voice_endpoint(request: VoiceRequest):
    try:
        response = await process_voice_input(request.text)
        return response
    except Exception as e:
        logger.error(f"Error in voice endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process voice input")

@api_router.get("/detection-history")
async def detection_history_endpoint():
    try:
        history = await get_detection_history()
        return history
    except Exception as e:
        logger.error(f"Error in detection history endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch detection history")

@api_router.post("/detect-disease")
async def disease_detection_endpoint(file: UploadFile = File(..., description="Image file to analyze")):
    try:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the file content
        image_data = await file.read()
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data received")
        
        logger.info(f"Processing image of size: {len(image_data)} bytes")
        result = await detect_disease(image_data)
        logger.info(f"Disease detection result: {result}")
        return result
        
    except HTTPException as he:
        logger.error(f"HTTP error in disease detection: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Error in disease detection endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@api_router.post("/ml-crop-recommendations")
async def ml_crop_recommendations_endpoint(weather_data: WeatherData):
    try:
        lat = weather_data.latitude if hasattr(weather_data, 'latitude') else 0
        lon = weather_data.longitude if hasattr(weather_data, 'longitude') else 0
        recommendations = await get_crop_recommendations(weather_data, lat, lon)
        return recommendations
    except Exception as e:
        logger.error(f"Error in ML crop recommendations endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get ML crop recommendations")

# Include the API router
app.include_router(api_router)
app.include_router(crop_router)

if __name__ == "__main__":
    # First, set up the disease detection model
    try:
        import setup_model
        logger.info("Setting up disease detection model...")
        setup_model.setup_model()
        logger.info("Disease detection model setup completed")
    except Exception as e:
        logger.error(f"Error setting up disease detection model: {e}")
        logger.warning("Continuing with server startup...")
    
    # Set up the crop recommendation model
    try:
        from services.ml_crop_service import train_crop_model
        logger.info("Setting up crop recommendation model...")
        train_crop_model()
        logger.info("Crop recommendation model setup completed")
    except Exception as e:
        logger.error(f"Error setting up crop recommendation model: {e}")
        logger.warning("Continuing with server startup...")
    
    logger.info("Starting server on http://0.0.0.0:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 