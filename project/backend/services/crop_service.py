from typing import List
import pandas as pd
import numpy as np
from datetime import datetime
import os
from models.crop import Crop
from models.weather import WeatherData
from fastapi import APIRouter
from services.disease_info_service import DiseaseInfoService
import logging
from services.ml_crop_service import get_ml_crop_recommendations

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct path to crops.csv
crops_file = os.path.join(os.path.dirname(current_dir), "data", "crops.csv")

# Load crop data
try:
    if not os.path.exists(crops_file):
        raise FileNotFoundError(f"Crops data file not found at: {crops_file}")
    
    # Read CSV with more flexible parsing
    crops_df = pd.read_csv(
        crops_file,
        skipinitialspace=True,  # Skip spaces after delimiter
        skip_blank_lines=True,  # Skip empty lines
        encoding='utf-8',       # Use UTF-8 encoding
        on_bad_lines='skip'     # Skip problematic lines
    )
    
    # Clean up the data
    crops_df = crops_df.dropna(how='all')  # Remove completely empty rows
    crops_df = crops_df.fillna('')         # Replace NaN with empty string
    
    logger.info(f"Successfully loaded crop data from: {crops_file}")
    logger.info(f"Number of crops loaded: {len(crops_df)}")
    
except Exception as e:
    logger.error(f"Error loading crop data: {str(e)}")
    raise Exception(f"Failed to load crop data: {str(e)}")

def get_current_season() -> str:
    """Determine current season based on month"""
    month = datetime.now().month
    if month in [6, 7, 8, 9, 10]:  # June to October
        return "Kharif"
    elif month in [11, 12, 1, 2, 3]:  # November to March
        return "Rabi"
    else:  # April and May
        return "Zaid"

def get_region_from_coordinates(lat: float, lon: float) -> str:
    """Determine region based on coordinates"""
    # Karnataka coordinates (approximate)
    if 11.5 <= lat <= 18.5 and 74 <= lon <= 78.5:
        return "South"
    # Maharashtra coordinates (approximate)
    elif 15.5 <= lat <= 22.5 and 72.5 <= lon <= 80.5:
        return "Central"
    # Punjab coordinates (approximate)
    elif 29.5 <= lat <= 32.5 and 73.5 <= lon <= 76.5:
        return "North"
    else:
        return "All"

def get_optimal_crops(weather_data: WeatherData, lat: float, lon: float) -> List[dict]:
    """Get optimal crops based on weather conditions and location"""
    current_season = get_current_season()
    region = get_region_from_coordinates(lat, lon)
    
    # Filter crops by season and region
    season_crops = crops_df[
        (crops_df['growing_season'].isin([current_season, 'Year-round'])) &
        (crops_df['region'].isin([region, 'All']))
    ]
    
    # Score each crop based on current weather conditions
    crop_scores = []
    for _, crop in season_crops.iterrows():
        try:
            # Temperature score (0-1)
            temp_score = 1 - min(
                abs(weather_data.temperature - float(crop['temperature_min'])),
                abs(weather_data.temperature - float(crop['temperature_max']))
            ) / 10

            # Humidity score (0-1)
            humidity_score = 1 - abs(weather_data.humidity - (float(crop['humidity_min']) + float(crop['humidity_max']))/2) / 100

            # Wind score (0-1)
            wind_score = 1 - min(weather_data.windSpeed, 10) / 10

            # Calculate total score
            total_score = (temp_score * 0.5) + (humidity_score * 0.3) + (wind_score * 0.2)
            
            crop_scores.append({
                "name": str(crop['name']),
                "score": round(total_score * 100, 2),  # Convert to percentage
                "description": str(crop['description']),
                "optimalTemperature": {
                    "min": float(crop['temperature_min']),
                    "max": float(crop['temperature_max'])
                },
                "waterRequirements": str(crop['water_requirement']),
                "growingSeason": str(crop['growing_season']),
                "region": str(crop['region']),
                "soilType": str(crop['soil_type']),
                "daysToHarvest": str(crop['days_to_harvest'])
            })
        except Exception as e:
            logger.error(f"Error processing crop {crop.get('name', 'unknown')}: {str(e)}")
            continue

    # Sort by score and return top 5 recommendations
    crop_scores.sort(key=lambda x: x["score"], reverse=True)
    return crop_scores[:5]

# Create API router
router = APIRouter(prefix="/api")

@router.get("/crops")
async def get_crops() -> List[Crop]:
    """Get all crops"""
    try:
        crops = []
        for _, row in crops_df.iterrows():
            crop = Crop(
                id=str(row.name),
                name=str(row['name']),
                description=str(row['description']),
                season=str(row['growing_season']),
                soil_type=str(row['soil_type']),
                water_requirement=str(row['water_requirement']),
                temperature_range=f"{row['temperature_min']}-{row['temperature_max']}°C"
            )
            crops.append(crop)
        return crops
    except Exception as e:
        logger.error(f"Error getting crops: {str(e)}")
        raise Exception("Failed to get crops")

async def get_crop_recommendations(weather_data: WeatherData, lat: float, lon: float) -> List[dict]:
    """Recommend crops based on weather conditions and location using ML model"""
    try:
        # Use the ML-based recommendation system
        return get_ml_crop_recommendations(weather_data, lat, lon)
    except Exception as e:
        logger.error(f"Error in ML crop recommendations: {str(e)}")
        logger.info("Falling back to rule-based recommendations")
        # Fall back to the rule-based system if ML fails
        return get_optimal_crops(weather_data, lat, lon)

router = APIRouter()
disease_service = DiseaseInfoService()

@router.get("/diseases")
async def get_diseases():
    return disease_service.get_all_diseases() 