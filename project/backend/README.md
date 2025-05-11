# Plant Disease Detection System

This system uses machine learning to detect plant diseases from images and provide treatment recommendations.

## Features

- Disease detection from plant images using traditional ML models (Random Forest)
- Detailed disease information including symptoms, causes, prevention, and treatment
- Supplement recommendations for treating detected diseases
- Weather data integration for crop recommendations
- Voice processing capabilities

## Setup and Usage

### Prerequisites

- Python 3.8+
- pip package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the System

The system can be run in different modes:

1. **Default mode** - Sets up the model and runs the server:
   ```
   python run.py
   ```

2. **Setup mode** - Only sets up the model without training:
   ```
   python run.py --setup
   ```

3. **Training mode** - Trains the model using disease_info.csv and supplement_info.csv:
   ```
   python run.py --train
   ```

### Disease Information Files

The system uses two CSV files to provide detailed disease information:

1. **disease_info.csv** - Contains basic disease information:
   - disease_name: Name of the disease
   - description: Brief description of the disease
   - symptoms: Common symptoms
   - causes: What causes the disease
   - prevention: Prevention methods
   - treatment: Treatment options

2. **supplement_info.csv** - Contains information about supplements for treating diseases:
   - disease_name: Name of the disease (matches disease_info.csv)
   - supplement_name: Name of the supplement
   - description: Description of the supplement
   - application_method: How to apply the supplement
   - precautions: Precautions when using the supplement

### Machine Learning Approach

The system uses a traditional machine learning approach instead of deep learning:

1. **Feature Extraction**: Images are processed to extract 50 features including:
   - Downsampled pixel values
   - Color statistics (mean, standard deviation, ratios)
   - Texture features
   - Edge detection metrics

2. **Model**: A Random Forest classifier is used for disease classification
   - Automatically falls back to SVM if accuracy is low
   - Uses scikit-learn's Pipeline with StandardScaler for preprocessing

3. **Training Process**:
   - Loads disease names from disease_info.csv
   - Creates synthetic features for each disease class
   - Trains the model on these features
   - Saves the trained model to models/disease_model.pkl

This approach is more lightweight than deep learning models and doesn't require a GPU.

### API Endpoints

The system provides the following API endpoints:

- `POST /api/detect-disease` - Upload an image for disease detection
- `GET /api/detection-history` - Get history of previous detections
- `GET /api/weather` - Get weather data for a location
- `GET /api/recommendations` - Get crop recommendations based on weather
- `POST /api/voice` - Process voice input

## Customizing Disease Information

You can customize the disease information by editing the CSV files:

1. Add new diseases to disease_info.csv
2. Add corresponding supplement information to supplement_info.csv
3. Run the system in training mode to update the model

## Troubleshooting

If you encounter issues:

1. Check the logs for error messages
2. Ensure the CSV files are properly formatted
3. Make sure all dependencies are installed correctly

## Supported Plant Diseases

The model can detect the following diseases:
- Tomato_Healthy
- Tomato_Early_blight
- Tomato_Late_blight
- Apple_Healthy
- Apple_Black_rot
- Apple_Scab
- And any additional diseases listed in disease_info.csv

## Directory Structure

- `download_model.py`: Script to generate the pre-trained model
- `run_server.py`: FastAPI server implementation
- `services/disease_service.py`: Disease detection service
- `models/`: Directory where the model is stored
- `data/detections/`: Directory where uploaded images are stored
- `data/detection_history.json`: File storing detection history 