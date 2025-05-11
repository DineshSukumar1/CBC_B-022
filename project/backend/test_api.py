import requests
import os
import sys
import logging
from PIL import Image
import io

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
API_URL = "http://localhost:8000"
TEST_IMAGE_PATH = os.path.join(os.path.dirname(__file__), 'test_image.jpg')

def create_test_image():
    """Create a simple test image if one doesn't exist."""
    if not os.path.exists(TEST_IMAGE_PATH):
        logger.info(f"Creating test image at: {TEST_IMAGE_PATH}")
        # Create a simple colored image
        img = Image.new('RGB', (224, 224), color=(50, 150, 50))
        img.save(TEST_IMAGE_PATH)
        logger.info("Test image created successfully")
    else:
        logger.info(f"Using existing test image at: {TEST_IMAGE_PATH}")

def test_root_endpoint():
    """Test the root endpoint."""
    try:
        logger.info(f"Testing root endpoint: {API_URL}")
        response = requests.get(API_URL)
        response.raise_for_status()
        logger.info(f"Root endpoint response: {response.json()}")
        return True
    except Exception as e:
        logger.error(f"Error testing root endpoint: {e}")
        return False

def test_detect_disease():
    """Test the disease detection endpoint."""
    try:
        endpoint = f"{API_URL}/api/detect-disease"
        logger.info(f"Testing disease detection endpoint: {endpoint}")
        
        # Ensure test image exists
        create_test_image()
        
        # Open and prepare the image
        with open(TEST_IMAGE_PATH, 'rb') as f:
            files = {'file': ('test_image.jpg', f, 'image/jpeg')}
            logger.info("Sending image to API...")
            response = requests.post(endpoint, files=files)
        
        # Check response
        if response.status_code == 200:
            logger.info("Disease detection successful!")
            logger.info(f"Response: {response.json()}")
            return True
        else:
            logger.error(f"Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing disease detection: {e}")
        return False

def test_detection_history():
    """Test the detection history endpoint."""
    try:
        endpoint = f"{API_URL}/api/detection-history"
        logger.info(f"Testing detection history endpoint: {endpoint}")
        
        response = requests.get(endpoint)
        response.raise_for_status()
        
        history = response.json()
        logger.info(f"Retrieved {len(history)} detection records")
        return True
    except Exception as e:
        logger.error(f"Error testing detection history: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting API tests...")
    
    # Test root endpoint
    if test_root_endpoint():
        logger.info("Root endpoint test passed")
    else:
        logger.error("Root endpoint test failed")
    
    # Test disease detection
    if test_detect_disease():
        logger.info("Disease detection test passed")
    else:
        logger.error("Disease detection test failed")
    
    # Test detection history
    if test_detection_history():
        logger.info("Detection history test passed")
    else:
        logger.error("Detection history test failed")
    
    logger.info("API tests completed") 