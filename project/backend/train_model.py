import os
import numpy as np
import pandas as pd
import logging
import sys
import pickle
import joblib
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import random
import traceback

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

# Set random seed for reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

def generate_synthetic_features(disease_classes, num_samples_per_class=100):
    """
    Generate synthetic features for each disease class
    """
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

def load_disease_info():
    """Load disease information from CSV files"""
    try:
        disease_info_path = os.path.join(DATA_DIR, 'disease_info.csv')
        supplement_info_path = os.path.join(DATA_DIR, 'supplement_info.csv')
        
        disease_info_df = pd.read_csv(disease_info_path)
        supplement_info_df = pd.read_csv(supplement_info_path)
        
        # Extract unique disease names
        disease_classes = disease_info_df['disease_name'].unique().tolist()
        
        # Add healthy variants for common plants
        plants = ["Tomato", "Apple", "Potato", "Pepper", "Corn"]
        for plant in plants:
            healthy_class = f"{plant}_Healthy"
            if healthy_class not in disease_classes:
                disease_classes.append(healthy_class)
        
        logger.info(f"Loaded {len(disease_classes)} disease classes")
        
        # Create disease info dictionary for later use
        disease_info = {}
        for _, row in disease_info_df.iterrows():
            disease_name = row['disease_name']
            supplements = supplement_info_df[supplement_info_df['disease_name'] == disease_name]
            
            disease_info[disease_name] = {
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
        
        return disease_classes, disease_info
    except Exception as e:
        logger.error(f"Error loading disease info: {e}")
        logger.error(traceback.format_exc())
        # Return default classes on error
        default_classes = [
            "Tomato_Healthy",
            "Tomato_Early_blight",
            "Tomato_Late_blight",
            "Apple_Healthy",
            "Apple_Black_rot",
            "Apple_Scab"
        ]
        return default_classes, {}

def train_model():
    """Train a machine learning model using disease information"""
    try:
        # Load disease information
        disease_classes, disease_info = load_disease_info()
        
        # Create necessary directories
        os.makedirs(MODEL_DIR, exist_ok=True)
        os.makedirs(DETECTIONS_DIR, exist_ok=True)
        
        # Generate synthetic features for training
        logger.info("Generating synthetic features for training...")
        X, y = generate_synthetic_features(disease_classes, num_samples_per_class=200)
        
        logger.info(f"Generated dataset with {X.shape[0]} samples and {X.shape[1]} features")
        
        # Split dataset into train and validation
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=SEED, stratify=y
        )
        
        # Create and train ML model
        logger.info("Training Random Forest Classifier...")
        
        # Create a pipeline with scaling and Random Forest
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=SEED,
                n_jobs=-1
            ))
        ])
        
        # Train the model
        pipeline.fit(X_train, y_train)
        
        # Evaluate the model
        y_pred = pipeline.predict(X_val)
        accuracy = accuracy_score(y_val, y_pred)
        logger.info(f"Validation accuracy: {accuracy:.4f}")
        
        # Try SVM if accuracy is not good enough
        if accuracy < 0.9:
            logger.info("Training SVM Classifier for comparison...")
            svm_pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', SVC(
                    probability=True,
                    random_state=SEED
                ))
            ])
            
            svm_pipeline.fit(X_train, y_train)
            svm_y_pred = svm_pipeline.predict(X_val)
            svm_accuracy = accuracy_score(y_val, svm_y_pred)
            logger.info(f"SVM Validation accuracy: {svm_accuracy:.4f}")
            
            # Use the better model
            if svm_accuracy > accuracy:
                logger.info("Using SVM model as it performed better")
                pipeline = svm_pipeline
                accuracy = svm_accuracy
        
        # Save the model and class mapping
        logger.info(f"Saving model to {MODEL_PATH}")
        
        # Save the model and class information
        model_data = {
            'model': pipeline,
            'classes': disease_classes,
            'accuracy': accuracy,
            'feature_extractor': extract_features_from_image
        }
        
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info("Training completed successfully!")
        return True
    
    except Exception as e:
        logger.error(f"Error training model: {e}")
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    train_model() 