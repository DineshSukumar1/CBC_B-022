import torch
from torchvision import transforms
from PIL import Image
import os
from .model_training import PlantDiseaseCNN
from .disease_info_service import DiseaseInfoService

class DiseaseDetectionService:
    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.transform = transforms.Compose([
            transforms.Resize(255),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Load class names from dataset directory
        self.class_names = sorted([d for d in os.listdir(os.path.join(os.path.dirname(model_path), "dataset")) 
                                 if os.path.isdir(os.path.join(os.path.dirname(model_path), "dataset", d))])
        
        # Initialize and load model
        self.model = PlantDiseaseCNN(num_classes=len(self.class_names))
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        
        # Initialize disease info service
        self.disease_info_service = DiseaseInfoService()

    def predict(self, image_path):
        """
        Predict disease from plant image and get detailed information
        Args:
            image_path: Path to the image file
        Returns:
            dict: Prediction results with class, confidence, and disease information
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Get prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
            
            # Get predicted disease name
            disease_name = self.class_names[predicted.item()]
            
            # Get disease information and recommendations
            disease_info = self.disease_info_service.get_disease_info(disease_name)
            recommendations = self.disease_info_service.get_disease_recommendations(disease_name)
            
            return {
                "prediction": {
                    "disease": disease_name,
                    "confidence": float(confidence.item()),
                    "all_probabilities": {
                        self.class_names[i]: float(prob.item())
                        for i, prob in enumerate(probabilities[0])
                    }
                },
                "disease_info": disease_info,
                "recommendations": recommendations
            }
            
        except Exception as e:
            raise Exception(f"Error during prediction: {str(e)}")

# Example usage:
if __name__ == "__main__":
    model_path = os.path.join(os.path.dirname(__file__), "..", "..", "models", "plant_disease_model.pth")
    detector = DiseaseDetectionService(model_path)
    
    # Test prediction
    test_image = "path/to/test/image.jpg"  # Replace with actual test image path
    result = detector.predict(test_image)
    print(f"Prediction: {result}") 