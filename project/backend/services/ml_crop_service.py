from typing import List, Dict
import pandas as pd
import numpy as np
from datetime import datetime
import os
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import logging
from models.weather import WeatherData

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(BASE_DIR), 'data'))
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(BASE_DIR), '..', 'models'))
CROP_MODEL_PATH = os.path.join(MODEL_DIR, 'crop_recommendation_model.pkl')
CROPS_FILE = os.path.join(DATA_DIR, 'crops.csv')

# Create directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)

# Load crop data
try:
    if not os.path.exists(CROPS_FILE):
        raise FileNotFoundError(f"Crops data file not found at: {CROPS_FILE}")
    
    # Read CSV with more flexible parsing
    crops_df = pd.read_csv(
        CROPS_FILE,
        skipinitialspace=True,
        skip_blank_lines=True,
        encoding='utf-8',
        on_bad_lines='skip'
    )
    
    # Clean up the data
    crops_df = crops_df.dropna(how='all')
    crops_df = crops_df.fillna('')
    
    logger.info(f"Successfully loaded crop data from: {CROPS_FILE}")
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

def train_crop_model():
    """Train a machine learning model for crop recommendations"""
    try:
        logger.info("Starting crop recommendation model training...")
        
        # Create synthetic training data based on crop information
        X = []  # Features: [temperature, humidity, season_encoded, region_encoded]
        y = []  # Target: crop name
        
        # Season encoding: Kharif=0, Rabi=1, Zaid=2, Year-round=3
        season_encoding = {
            'Kharif': 0,
            'Rabi': 1, 
            'Zaid': 2,
            'Year-round': 3
        }
        
        # Region encoding: South=0, Central=1, North=2, All=3
        region_encoding = {
            'South': 0,
            'Central': 1,
            'North': 2,
            'All': 3
        }
        
        # Generate training samples for each crop
        for _, crop in crops_df.iterrows():
            crop_name = crop['name']
            temp_min = float(crop['temperature_min'])
            temp_max = float(crop['temperature_max'])
            humidity_min = float(crop['humidity_min'])
            humidity_max = float(crop['humidity_max'])
            season = crop['growing_season']
            region = crop['region']
            
            # Generate 20 samples per crop with variations
            for _ in range(20):
                # Random temperature within crop's range
                temp = np.random.uniform(temp_min, temp_max)
                # Random humidity within crop's range
                humidity = np.random.uniform(humidity_min, humidity_max)
                # Season encoding
                season_code = season_encoding.get(season, 3)  # Default to Year-round
                # Region encoding
                region_code = region_encoding.get(region, 3)  # Default to All
                
                # Create feature vector
                features = [temp, humidity, season_code, region_code]
                X.append(features)
                y.append(crop_name)
        
        # Convert to numpy arrays
        X = np.array(X)
        y = np.array(y)
        
        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Create and train the model pipeline
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            ))
        ])
        
        # Train the model
        pipeline.fit(X_train, y_train)
        
        # Evaluate the model
        accuracy = pipeline.score(X_test, y_test)
        logger.info(f"Model accuracy: {accuracy:.4f}")
        
        # Save the model
        with open(CROP_MODEL_PATH, 'wb') as f:
            pickle.dump(pipeline, f)
        
        logger.info(f"Model saved to {CROP_MODEL_PATH}")
        return True
    
    except Exception as e:
        logger.error(f"Error training crop model: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def load_crop_model():
    """Load the trained crop recommendation model"""
    try:
        if os.path.exists(CROP_MODEL_PATH):
            with open(CROP_MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            logger.info("Crop recommendation model loaded successfully")
            return model
        else:
            logger.warning("Crop model not found, training new model...")
            train_crop_model()
            with open(CROP_MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            return model
    except Exception as e:
        logger.error(f"Error loading crop model: {e}")
        return None

# Load or train the model
crop_model = load_crop_model()

def get_ml_crop_recommendations(weather_data: WeatherData, lat: float, lon: float) -> List[Dict]:
    """Get crop recommendations using the ML model"""
    try:
        if crop_model is None:
            logger.error("Crop model not available")
            raise Exception("Crop recommendation model not available")
        
        # Get current season and region
        current_season = get_current_season()
        region = get_region_from_coordinates(lat, lon)
        
        # Season encoding: Kharif=0, Rabi=1, Zaid=2, Year-round=3
        season_encoding = {
            'Kharif': 0,
            'Rabi': 1, 
            'Zaid': 2,
            'Year-round': 3
        }
        
        # Region encoding: South=0, Central=1, North=2, All=3
        region_encoding = {
            'South': 0,
            'Central': 1,
            'North': 2,
            'All': 3
        }
        
        # Create feature vector for prediction
        features = np.array([
            [
                weather_data.temperature,
                weather_data.humidity,
                season_encoding.get(current_season, 3),
                region_encoding.get(region, 3)
            ]
        ])
        
        # Get prediction probabilities for all crops
        probabilities = crop_model.predict_proba(features)[0]
        
        # Get crop names from the model classes
        crop_names = crop_model.classes_
        
        # Create list of (crop_name, probability) tuples and sort by probability
        crop_probs = [(crop, prob) for crop, prob in zip(crop_names, probabilities)]
        crop_probs.sort(key=lambda x: x[1], reverse=True)
        
        # Get top 5 recommendations
        top_recommendations = []
        for crop_name, probability in crop_probs[:5]:
            # Get crop details from the dataframe
            crop_info = crops_df[crops_df['name'] == crop_name].iloc[0]
            
            recommendation = {
                "name": crop_name,
                "score": round(probability * 100, 2),
                "description": str(crop_info['description']),
                "optimalTemperature": {
                    "min": float(crop_info['temperature_min']),
                    "max": float(crop_info['temperature_max'])
                },
                "waterRequirements": str(crop_info['water_requirement']),
                "growingSeason": str(crop_info['growing_season']),
                "region": str(crop_info['region']),
                "soilType": str(crop_info['soil_type']),
                "daysToHarvest": str(crop_info['days_to_harvest'])
            }
            
            top_recommendations.append(recommendation)
        
        return top_recommendations
        
    except Exception as e:
        logger.error(f"Error getting ML crop recommendations: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise Exception(f"Failed to get crop recommendations: {str(e)}") 