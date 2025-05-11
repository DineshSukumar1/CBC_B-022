from fastapi import HTTPException
import numpy as np
from PIL import Image
import io
import os
from dotenv import load_dotenv
import pickle
import json
from datetime import datetime
import uuid
import logging
import pandas as pd
from typing import Dict, List, Optional
import traceback

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

# Load disease and supplement information
try:
    disease_info_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../data/disease_info.csv'))
    supplement_info_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../data/supplement_info.csv'))
    
    # Create disease info dictionary
    DISEASE_INFO = {}
    for _, row in disease_info_df.iterrows():
        disease_name = row['disease_name']
        supplements = supplement_info_df[supplement_info_df['disease_name'] == disease_name]
        
        DISEASE_INFO[disease_name] = {
            'description': row['description'],
            'symptoms': row['symptoms'],
            'causes': row['causes'],
            'prevention': row['prevention'],
            'treatment': row['treatment'],
            'supplements': [
                {
                    'name': sup['supplement_name'],
                    'description': sup['description'],
                    'application': sup['application_method'],
                    'precautions': sup['precautions']
                }
                for _, sup in supplements.iterrows()
            ]
        }
    logger.info(f"Successfully loaded disease info for {len(DISEASE_INFO)} diseases")
except Exception as e:
    logger.error(f"Error loading disease info: {e}\n{traceback.format_exc()}")
    DISEASE_INFO = {}

# Model configuration - Fix path to be absolute
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../models'))
MODEL_PATH = os.path.join(MODEL_DIR, 'disease_model.pkl')
DETECTIONS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/detections'))
DETECTION_HISTORY_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/detection_history.json'))

# Ensure directories exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DETECTIONS_DIR, exist_ok=True)
os.makedirs(os.path.dirname(DETECTION_HISTORY_PATH), exist_ok=True)

class PlantDiseaseModel:
    def __init__(self):
        self.model = None
        self.feature_extractor = None
        self.classes = []
        logger.info("Initializing Plant Disease ML Model")
        self.initialize_model()
    
    def initialize_model(self):
        """Initialize the model from the saved file or create a new one."""
        try:
            if os.path.exists(MODEL_PATH):
                logger.info(f"Loading model from: {MODEL_PATH}")
                with open(MODEL_PATH, 'rb') as f:
                    model_data = pickle.load(f)
                
                # Get model components
                self.model = model_data['model']
                self.classes = model_data['classes']
                self.feature_extractor = model_data.get('feature_extractor')
                
                logger.info(f"Loaded ML model with {len(self.classes)} disease classes")
            else:
                logger.warning(f"Model file not found at: {MODEL_PATH}")
                logger.info("Creating a new default model")
                
                # Import setup_model to create a new model
                import sys
                sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
                import setup_model
                
                # Create a new model
                setup_model.setup_model()
                
                # Check if model was created successfully
                if not os.path.exists(MODEL_PATH):
                    raise FileNotFoundError(f"Model file was not created at {MODEL_PATH}")
                
                # Load the newly created model
                with open(MODEL_PATH, 'rb') as f:
                    model_data = pickle.load(f)
                
                # Get model components
                self.model = model_data['model']
                self.classes = model_data['classes']
                self.feature_extractor = model_data.get('feature_extractor')
                
                logger.info(f"Created new ML model with {len(self.classes)} disease classes")
        except Exception as e:
            logger.error(f"Error initializing model: {e}")
            logger.error(traceback.format_exc())
            
            # Create a simple fallback model
            try:
                logger.info("Attempting to create a fallback model")
                
                # Import necessary modules for fallback model
                from sklearn.ensemble import RandomForestClassifier
                from sklearn.preprocessing import StandardScaler
                from sklearn.pipeline import Pipeline
                
                # Create a simple model with default classes
                default_classes = [
                    "Tomato_Healthy",
                    "Tomato_Early_blight",
                    "Tomato_Late_blight",
                    "Apple_Healthy",
                    "Apple_Black_rot",
                    "Apple_Scab"
                ]
                
                # Create a simple feature extractor
                def simple_feature_extractor(image):
                    img_gray = image.convert('L').resize((50, 50))
                    features = np.array(img_gray).flatten() / 255.0
                    return features
                
                # Create a simple pipeline
                pipeline = Pipeline([
                    ('scaler', StandardScaler()),
                    ('classifier', RandomForestClassifier(n_estimators=10, random_state=42))
                ])
                
                # Train on dummy data
                X = np.random.rand(60, 2500)  # 10 samples per class, 50x50 features
                y = np.repeat(np.arange(6), 10)  # 6 classes, 10 samples each
                pipeline.fit(X, y)
                
                self.model = pipeline
                self.classes = default_classes
                self.feature_extractor = simple_feature_extractor
                
                logger.info("Created fallback model with default classes")
            except Exception as fallback_error:
                logger.error(f"Failed to create fallback model: {fallback_error}")
                logger.error(traceback.format_exc())
                raise Exception(f"Failed to initialize model: {str(e)}")

    def predict(self, image):
        """Make a prediction using the ML model"""
        try:
            # Extract features from image
            if self.feature_extractor:
                features = self.feature_extractor(image)
            else:
                # Fallback feature extraction if not provided in the model
                logger.warning("No feature extractor found, using default method")
                # Convert image to grayscale and resize
                img_gray = image.convert('L').resize((50, 50))
                # Flatten and normalize
                features = np.array(img_gray).flatten() / 255.0
            
            # Reshape for single sample prediction
            features = features.reshape(1, -1)
            
            # Get prediction probabilities
            probabilities = self.model.predict_proba(features)[0]
            
            # Get top prediction
            predicted_idx = np.argmax(probabilities)
            confidence = probabilities[predicted_idx]
            disease_name = self.classes[predicted_idx]
            
            # Get top 3 predictions (or fewer if there are fewer classes)
            top_k = min(3, len(self.classes))
            top_indices = np.argsort(probabilities)[-top_k:][::-1]
            top_predictions = [
                {
                    "disease": self.classes[idx],
                    "confidence": probabilities[idx] * 100
                }
                for idx in top_indices
            ]
            
            return disease_name, confidence * 100, top_predictions
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            logger.error(traceback.format_exc())
            raise Exception(f"Failed to make prediction: {str(e)}")

# Initialize model
plant_disease_model = PlantDiseaseModel()

def get_disease_info(disease_name):
    """Get information about a disease."""
    try:
        if disease_name in DISEASE_INFO:
            return DISEASE_INFO[disease_name]
        else:
            # Try to match with similar disease name
            for key in DISEASE_INFO.keys():
                if disease_name.lower() in key.lower() or key.lower() in disease_name.lower():
                    logger.info(f"Found similar disease: {key} for {disease_name}")
                    return DISEASE_INFO[key]
            
            # If still not found, check if it's a healthy plant
            if "Healthy" in disease_name:
                plant_name = disease_name.split("_")[0]
                logger.info(f"Generating healthy plant info for: {plant_name}")
                return {
                    "description": f"Healthy {plant_name} plant with no signs of disease",
                    "symptoms": "No symptoms of disease. The plant appears healthy with normal growth patterns.",
                    "causes": "N/A - Plant is healthy",
                    "prevention": "Continue good gardening practices: proper watering, adequate spacing, and regular monitoring.",
                    "treatment": "No treatment needed. Continue regular care.",
                    "supplements": []
                }
            
            logger.warning(f"No information available for disease: {disease_name}")
            return {
                "description": "Information not available",
                "symptoms": "Information not available",
                "causes": "Information not available",
                "prevention": "Information not available",
                "treatment": "Information not available",
                "recommendations": "Please consult with an agricultural expert."
            }
    except Exception as e:
        logger.error(f"Error getting disease info: {e}")
        logger.error(traceback.format_exc())
        return {
            "description": "Error retrieving information",
            "symptoms": "Error retrieving information",
            "causes": "Error retrieving information",
            "prevention": "Error retrieving information",
            "treatment": "Error retrieving information",
            "recommendations": "Please try again later."
        }

async def detect_disease(image_data):
    """Detect disease from image data."""
    try:
        logger.info("Starting disease detection")
        
        # Save image to disk
        try:
            image_id = str(uuid.uuid4())
            image_filename = f"{image_id}.jpg"
            image_path = os.path.join(DETECTIONS_DIR, image_filename)
            
            with open(image_path, "wb") as f:
                f.write(image_data)
            logger.info(f"Image saved to: {image_path}")
        except Exception as e:
            logger.error(f"Error saving image to disk: {e}")
            logger.error(traceback.format_exc())
            # Continue with detection even if saving fails
        
        # Open image
        try:
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            logger.info(f"Image opened successfully: {image.size}, {image.mode}")
        except Exception as e:
            logger.error(f"Error opening image: {e}")
            logger.error(traceback.format_exc())
            raise ValueError(f"Failed to open image: {str(e)}")
        
        # Make prediction
        try:
            disease_name, confidence_score, top_predictions = plant_disease_model.predict(image)
            logger.info(f"Prediction: {disease_name}, Confidence: {confidence_score:.2f}%")
            logger.info("Prediction completed successfully")
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            logger.error(traceback.format_exc())
            raise ValueError(f"Failed to analyze image: {str(e)}")
        
        # Get disease information
        try:
            disease_info = get_disease_info(disease_name)
            logger.info("Disease information retrieved successfully")
        except Exception as e:
            logger.error(f"Error getting disease info: {e}")
            logger.error(traceback.format_exc())
            # Use fallback information
            disease_info = {
                "description": "Information not available",
                "symptoms": "Information not available",
                "causes": "Information not available",
                "prevention": "Information not available",
                "treatment": "Information not available",
                "recommendations": "Please consult with an agricultural expert."
            }
        
        # Create result
        result = {
            "id": image_id,
            "timestamp": datetime.now().isoformat(),
            "image_url": f"/detections/{image_filename}",
            "disease_name": disease_name,
            "confidence": confidence_score,
            "description": disease_info.get("description", "Information not available"),
            "symptoms": disease_info.get("symptoms", "Information not available"),
            "causes": disease_info.get("causes", "Information not available"),
            "treatment": disease_info.get("treatment", "Information not available"),
            "prevention": disease_info.get("prevention", "Information not available"),
            "supplements": disease_info.get("supplements", []),
            "alternative_predictions": top_predictions[1:]
        }
        
        # Save to detection history
        try:
            save_detection_history(result)
            logger.info("Detection result saved to history")
        except Exception as e:
            logger.error(f"Error saving detection history: {e}")
            logger.error(traceback.format_exc())
            # Continue even if saving history fails
        
        logger.info("Disease detection completed successfully")
        return result
        
    except ValueError as ve:
        # Known validation errors
        logger.error(f"Validation error in disease detection: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Unexpected errors
        logger.error(f"Unexpected error in disease detection: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def save_detection_history(result):
    """Save detection result to history."""
    try:
        # Load existing history
        history = []
        if os.path.exists(DETECTION_HISTORY_PATH):
            with open(DETECTION_HISTORY_PATH, "r") as f:
                    history = json.load(f)
        
        # Add new result
        history.append(result)
        
        # Save updated history
        with open(DETECTION_HISTORY_PATH, "w") as f:
            json.dump(history, f, indent=2)
        
        logger.info("Detection history saved successfully")
    except Exception as e:
        logger.error(f"Error saving detection history: {e}")
        logger.error(traceback.format_exc())

async def get_detection_history():
    """Get detection history."""
    try:
        if os.path.exists(DETECTION_HISTORY_PATH):
            with open(DETECTION_HISTORY_PATH, "r") as f:
                history = json.load(f)
            return history
        else:
            return []
    except Exception as e:
        logger.error(f"Error getting detection history: {e}")
        logger.error(traceback.format_exc())
        return []

# Disease information
DISEASE_INFO = {
    "Tomato_Healthy": {
        "symptoms": "No symptoms of disease. The plant appears healthy with vibrant green leaves and normal growth patterns.",
        "treatment": "No treatment needed. Continue regular care including proper watering, fertilization, and sunlight exposure.",
        "prevention": "Maintain good garden hygiene, proper spacing between plants, and regular watering at the base of the plant.",
        "recommendations": "Monitor regularly for any signs of disease. Ensure proper nutrition with balanced fertilizers. Provide adequate support for growing plants."
    },
    "Tomato_Early_blight": {
        "symptoms": "Dark brown spots with concentric rings forming a target-like pattern. Yellowing leaves starting from lower leaves and moving upward. Affected leaves may eventually wither and drop.",
        "treatment": "Remove and destroy infected leaves immediately. Apply fungicides containing chlorothalonil, mancozeb, or copper at first sign of disease. Ensure proper air circulation around plants.",
        "prevention": "Rotate crops (don't plant tomatoes in the same location for 3-4 years). Avoid overhead watering and water at the base of plants. Space plants properly for good air circulation. Use mulch to prevent soil splash.",
        "recommendations": "Apply fungicides every 7-10 days during humid weather. Water plants at the base in the morning so leaves can dry during the day. Apply organic mulch to prevent spores from splashing onto leaves."
    },
    "Tomato_Late_blight": {
        "symptoms": "Dark water-soaked spots on leaves, stems, and fruits. White fuzzy growth on leaf undersides in humid conditions. Rapid browning and wilting of foliage. Firm, dark brown lesions on fruits.",
        "treatment": "Remove infected plants immediately to prevent spread. Apply copper-based fungicides or other approved fungicides for late blight. Harvest any mature fruits from infected plants.",
        "prevention": "Increase plant spacing for better air circulation. Avoid overhead watering. Plant resistant varieties when available. Remove volunteer tomato plants that may harbor disease.",
        "recommendations": "This disease spreads rapidly in cool, wet weather. Take immediate action if detected. Monitor weather forecasts for late blight conditions. Consider preventive fungicide applications during high-risk periods."
    },
    "Apple_Healthy": {
        "symptoms": "No symptoms of disease. The tree shows normal leaf color, growth patterns, and fruit development.",
        "treatment": "No treatment needed. Continue regular care including proper pruning, fertilization, and pest monitoring.",
        "prevention": "Maintain good orchard hygiene by removing fallen leaves and fruit. Proper pruning to ensure good air circulation within the canopy.",
        "recommendations": "Regular monitoring for early detection of any issues. Apply dormant oil sprays during the dormant season to control overwintering pests and diseases."
    },
    "Apple_Black_rot": {
        "symptoms": "Purple spots on leaves that enlarge and develop brown centers. Rotting fruit with concentric rings of black pycnidia (fungal fruiting bodies). Cankers on branches with rough or cracked bark.",
        "treatment": "Prune out infected branches at least 8 inches below visible infection. Apply fungicides containing captan, myclobutanil, or thiophanate-methyl according to label directions. Remove mummified fruits.",
        "prevention": "Remove mummified fruits and cankers from trees. Prune regularly for good air circulation. Clean up fallen leaves and fruit at the end of the season.",
        "recommendations": "Sanitize pruning tools between cuts with 10% bleach solution to prevent spread. Begin fungicide applications at bud break and continue at 10-14 day intervals during wet periods."
    },
    "Apple_Scab": {
        "symptoms": "Olive-green to brown velvety spots on leaves. Leaves may yellow and drop prematurely. Scabby, dark, corky spots on fruits that may cause cracking. Deformed fruits with uneven growth.",
        "treatment": "Apply fungicides containing captan, myclobutanil, or sulfur at 7-10 day intervals during wet spring weather. Continue applications until dry summer weather.",
        "prevention": "Rake and destroy fallen leaves where the fungus overwinters. Improve air circulation through proper pruning. Plant resistant varieties when establishing new orchards.",
        "recommendations": "Begin fungicide applications at bud break and continue through the growing season during wet periods. Avoid overhead irrigation. Thin fruit clusters to reduce humidity and allow better spray coverage."
    }
} 