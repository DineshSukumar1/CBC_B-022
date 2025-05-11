import os
import logging
import shutil
import random
import numpy as np
from PIL import Image
from pathlib import Path
import traceback
import sys

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), '../data/plant_diseases')
SPLITS_DIR = os.path.join(DATASET_DIR, 'splits')

# Disease classes to create
DISEASE_CLASSES = [
    "Tomato_Healthy",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Apple_Healthy",
    "Apple_Black_rot",
    "Apple_Scab"
]

def create_synthetic_dataset():
    """Create a small synthetic dataset for testing."""
    try:
        logger.info(f"Creating dataset directory at: {DATASET_DIR}")
        os.makedirs(DATASET_DIR, exist_ok=True)
        
        logger.info(f"Creating splits directory at: {SPLITS_DIR}")
        os.makedirs(SPLITS_DIR, exist_ok=True)
        
        logger.info("Creating synthetic dataset...")
        
        # Create splits directories
        for split in ['train', 'val', 'test']:
            split_dir = os.path.join(SPLITS_DIR, split)
            logger.info(f"Creating split directory: {split_dir}")
            os.makedirs(split_dir, exist_ok=True)
            
            # Create class directories
            for disease in DISEASE_CLASSES:
                class_dir = os.path.join(split_dir, disease)
                logger.info(f"Creating class directory: {class_dir}")
                os.makedirs(class_dir, exist_ok=True)
                
                # Create synthetic images
                num_images = 20 if split == 'train' else 5
                logger.info(f"Creating {num_images} images for {disease} in {split} split")
                create_images_for_class(class_dir, disease, num_images)
        
        logger.info("Synthetic dataset created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error creating synthetic dataset: {e}")
        logger.error(traceback.format_exc())
        return False

def create_images_for_class(directory, class_name, num_images):
    """Create synthetic images for a class."""
    for i in range(num_images):
        try:
            # Create a colored image with some patterns
            img_size = 224
            img_array = np.zeros((img_size, img_size, 3), dtype=np.uint8)
            
            # Use different base colors for different classes
            if "Healthy" in class_name:
                base_color = [0, 200, 0]  # Green for healthy
            elif "Early_blight" in class_name:
                base_color = [200, 150, 0]  # Yellow-brown for early blight
            elif "Late_blight" in class_name:
                base_color = [150, 50, 50]  # Dark brown for late blight
            elif "Black_rot" in class_name:
                base_color = [50, 50, 50]  # Dark for black rot
            elif "Scab" in class_name:
                base_color = [150, 100, 50]  # Brown for scab
            else:
                base_color = [100, 100, 100]  # Gray for other
            
            # Add base color
            img_array[:, :] = base_color
            
            # Add some random patterns
            for _ in range(20):
                x = random.randint(0, img_size-50)
                y = random.randint(0, img_size-50)
                w = random.randint(10, 50)
                h = random.randint(10, 50)
                color_variation = [random.randint(-30, 30) for _ in range(3)]
                pattern_color = [max(0, min(255, base_color[j] + color_variation[j])) for j in range(3)]
                img_array[y:y+h, x:x+w] = pattern_color
            
            # Convert to PIL Image and save
            img = Image.fromarray(img_array)
            img_path = os.path.join(directory, f"{class_name}_{i+1:03d}.png")
            logger.debug(f"Saving image to: {img_path}")
            img.save(img_path)
        except Exception as e:
            logger.error(f"Error creating image {i+1} for {class_name}: {e}")
            logger.error(traceback.format_exc())

if __name__ == "__main__":
    logger.info("Starting dataset preparation...")
    if create_synthetic_dataset():
        logger.info("Dataset preparation completed successfully!")
    else:
        logger.error("Dataset preparation failed!") 