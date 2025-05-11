import os
import logging
import sys
import argparse

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Set up command line arguments
    parser = argparse.ArgumentParser(description='Run the plant disease detection system')
    parser.add_argument('--train', action='store_true', help='Train the model using disease information files')
    parser.add_argument('--setup', action='store_true', help='Only set up the model without training')
    args = parser.parse_args()
    
    try:
        if args.train:
            # Train the model using disease_info.csv and supplement_info.csv
            logger.info("Training disease detection model using disease information...")
            import train_model
            train_model.train_model()
            logger.info("Model training completed")
        elif args.setup:
            # Only set up the model without training
            logger.info("Setting up disease detection model...")
            import setup_model
            setup_model.setup_model()
            logger.info("Model setup completed")
        else:
            # Default: set up the model and run the server
            logger.info("Setting up disease detection model...")
            import setup_model
            setup_model.setup_model()
            logger.info("Model setup completed")
        
            # Then run the server
            logger.info("Starting FastAPI server...")
            import uvicorn
            uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    
    except Exception as e:
        logger.error(f"Error: {e}")
        logger.error("Operation failed") 