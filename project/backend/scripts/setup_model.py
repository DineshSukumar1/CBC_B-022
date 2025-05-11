import os
import torch
import torchvision.models as models
import torch.nn as nn

def setup_model():
    # Create necessary directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('data/detections', exist_ok=True)
    
    # Model path
    model_path = 'models/disease_model.pth'
    
    # Always create a new model based on ResNet50
    print("Creating a new dummy model...")
    model = models.resnet50(weights=None)
    num_classes = 25  # Number of disease classes
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    torch.save(model, model_path)
    print("Model setup complete!")

if __name__ == "__main__":
    setup_model() 