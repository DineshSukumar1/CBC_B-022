import os
import logging
import sys
import pandas as pd
import numpy as np
import pickle
from typing import List, Dict
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Define absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, '../models'))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, 'data'))
MODEL_PATH = os.path.join(MODEL_DIR, 'disease_model.pkl')
DETECTIONS_DIR = os.path.abspath(os.path.join(BASE_DIR, '../data/detections'))

def extract_features_from_image(image):
    """
    Extract features from an image for ML model prediction
    This is a simplified version that converts an image to a feature vector
    """
    # Resize image to a standard size
    img_resized = image.resize((50, 50))
    
    # Convert to grayscale
    img_gray = img_resized.convert('L')
    
    # Convert to numpy array and flatten
    img_array = np.array(img_gray).flatten()
    
    # Normalize to 0-1
    img_array = img_array / 255.0
    
    # Extract some basic statistical features
    features = np.zeros(50)
    
    # First 25 features: downsampled image pixels (5x5 grid)
    img_small = img_resized.resize((5, 5)).convert('L')
    img_small_array = np.array(img_small).flatten() / 255.0
    features[:25] = img_small_array
    
    # Next features: color statistics from different channels
    img_rgb = np.array(img_resized.convert('RGB'))
    
    # RGB channel means
    features[25] = np.mean(img_rgb[:,:,0]) / 255.0  # R mean
    features[26] = np.mean(img_rgb[:,:,1]) / 255.0  # G mean
    features[27] = np.mean(img_rgb[:,:,2]) / 255.0  # B mean
    
    # RGB channel standard deviations
    features[28] = np.std(img_rgb[:,:,0]) / 255.0   # R std
    features[29] = np.std(img_rgb[:,:,1]) / 255.0   # G std
    features[30] = np.std(img_rgb[:,:,2]) / 255.0   # B std
    
    # RGB ratios
    r_mean = np.mean(img_rgb[:,:,0])
    g_mean = np.mean(img_rgb[:,:,1])
    b_mean = np.mean(img_rgb[:,:,2])
    total = r_mean + g_mean + b_mean
    if total > 0:
        features[31] = r_mean / total
        features[32] = g_mean / total
        features[33] = b_mean / total
    
    # Image statistics
    features[34] = np.mean(img_array)  # Mean brightness
    features[35] = np.std(img_array)   # Contrast
    features[36] = np.max(img_array) - np.min(img_array)  # Dynamic range
    
    # Edge detection (simple gradient magnitude)
    dx = np.diff(np.array(img_gray), axis=1)
    dy = np.diff(np.array(img_gray), axis=0)
    features[37] = np.mean(np.abs(dx)) / 255.0
    features[38] = np.mean(np.abs(dy)) / 255.0
    
    # Fill remaining features with zeros
    
    return features

def load_disease_classes() -> List[str]:
    """Load disease classes from disease_info.csv"""
    try:
        # Path to disease info CSV
        disease_info_path = os.path.join(DATA_DIR, 'disease_info.csv')
        
        if os.path.exists(disease_info_path):
            df = pd.read_csv(disease_info_path)
            # Extract unique disease names and add healthy variants
            disease_classes = df['disease_name'].unique().tolist()
            
            # Add healthy variants for common plants
            plants = ["Tomato", "Apple", "Potato", "Pepper", "Corn"]
            for plant in plants:
                healthy_class = f"{plant}_Healthy"
                if healthy_class not in disease_classes:
                    disease_classes.append(healthy_class)
            
            logger.info(f"Loaded {len(disease_classes)} disease classes from CSV")
            return disease_classes
        else:
            logger.warning(f"Disease info file not found at: {disease_info_path}")
            # Return default classes
            return [
                "Tomato_Healthy",
                "Tomato_Early_blight",
                "Tomato_Late_blight",
                "Apple_Healthy",
                "Apple_Black_rot",
                "Apple_Scab"
            ]
    except Exception as e:
        logger.error(f"Error loading disease classes: {e}")
        # Return default classes on error
        return [
            "Tomato_Healthy",
            "Tomato_Early_blight",
            "Tomato_Late_blight",
            "Apple_Healthy",
            "Apple_Black_rot",
            "Apple_Scab"
        ]

# Load disease classes
DISEASE_CLASSES = load_disease_classes()

def generate_synthetic_features(disease_classes, num_samples_per_class=50):
    """Generate synthetic features for each disease class"""
    X = []
    y = []
    
    for class_idx, disease_name in enumerate(disease_classes):
        logger.info(f"Generating features for class {class_idx}: {disease_name}")
        
        for i in range(num_samples_per_class):
            # Generate synthetic features based on disease characteristics
            # We'll use 50 features for each sample
            features = np.zeros(50)
            
            # Seed based on disease name for consistency
            color_seed = hash(disease_name) % 255
            
            # Base features - different for each disease class
            features[0] = (color_seed * 13) % 100 / 100.0  # Normalized between 0-1
            features[1] = (color_seed * 17) % 100 / 100.0
            features[2] = (color_seed * 19) % 100 / 100.0
            
            # Add some patterns based on disease name
            if "Healthy" in disease_name:
                # Healthy plants have different feature patterns
                features[3:10] = np.random.normal(0.8, 0.1, 7)  # Higher values in these features
                features[10:15] = np.random.normal(0.2, 0.1, 5)  # Lower values in these features
            elif "Blight" in disease_name:
                # Blight has specific feature patterns
                features[3:10] = np.random.normal(0.3, 0.1, 7)
                features[10:15] = np.random.normal(0.7, 0.1, 5)
            elif "Rot" in disease_name:
                # Rot has different feature patterns
                features[3:10] = np.random.normal(0.1, 0.1, 7)
                features[10:15] = np.random.normal(0.9, 0.1, 5)
            
            # Add some randomness to other features
            features[15:] = np.random.normal(0.5, 0.3, 35)
            
            # Add small noise to make each sample unique
            noise = np.random.normal(0, 0.05, 50)
            features += noise
            
            # Ensure all features are between 0 and 1
            features = np.clip(features, 0, 1)
            
            X.append(features)
            y.append(class_idx)
    
    return np.array(X), np.array(y)

def setup_model():
    """Create a simple ML model for disease detection without fine-tuning."""
    try:
        # Create necessary directories
        logger.info("Creating necessary directories...")
        os.makedirs(MODEL_DIR, exist_ok=True)
        os.makedirs(DETECTIONS_DIR, exist_ok=True)
        
        # Create synthetic data for training a simple model
        logger.info("Generating synthetic data for model setup...")
        X, y = generate_synthetic_features(DISEASE_CLASSES)
        
        # Create a simple Random Forest model
        logger.info("Creating a Random Forest Classifier...")
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(
                n_estimators=50,  # Smaller model for quick setup
                max_depth=8,
                random_state=42,
                n_jobs=-1
            ))
        ])
        
        # Train the model on synthetic data
        logger.info("Training model on synthetic data...")
        pipeline.fit(X, y)
        
        # Save the model
        logger.info(f"Saving model to {MODEL_PATH}")
        model_data = {
            'model': pipeline,
            'classes': DISEASE_CLASSES,
            'feature_extractor': extract_features_from_image
        }
        
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info("Model setup completed successfully!")
        return True
    
    except Exception as e:
        logger.error(f"Error setting up model: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    setup_model() 