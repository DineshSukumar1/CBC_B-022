import pandas as pd
import os
from typing import List, Dict

class DiseaseInfoService:
    def __init__(self):
        # Get the current directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Construct path to disease_info.csv
        self.disease_file = os.path.join(os.path.dirname(current_dir), "data", "disease_info.csv")
        self.supplement_file = os.path.join(os.path.dirname(current_dir), "data", "supplement_info.csv")
        
        # Load disease and supplement data
        self.disease_df = self._load_disease_data()
        self.supplement_df = self._load_supplement_data()

    def _load_disease_data(self) -> pd.DataFrame:
        """Load disease information from CSV file"""
        try:
            if not os.path.exists(self.disease_file):
                raise FileNotFoundError(f"Disease data file not found at: {self.disease_file}")
            
            df = pd.read_csv(
                self.disease_file,
                skipinitialspace=True,
                skip_blank_lines=True,
                encoding='utf-8',
                on_bad_lines='skip'
            )
            
            df = df.dropna(how='all')
            df = df.fillna('')
            print(f"Successfully loaded disease data from: {self.disease_file}")
            return df
            
        except Exception as e:
            print(f"Error loading disease data: {str(e)}")
            raise Exception(f"Failed to load disease data: {str(e)}")

    def _load_supplement_data(self) -> pd.DataFrame:
        """Load supplement information from CSV file"""
        try:
            if not os.path.exists(self.supplement_file):
                raise FileNotFoundError(f"Supplement data file not found at: {self.supplement_file}")
            
            df = pd.read_csv(
                self.supplement_file,
                skipinitialspace=True,
                skip_blank_lines=True,
                encoding='utf-8',
                on_bad_lines='skip'
            )
            
            df = df.dropna(how='all')
            df = df.fillna('')
            print(f"Successfully loaded supplement data from: {self.supplement_file}")
            return df
            
        except Exception as e:
            print(f"Error loading supplement data: {str(e)}")
            raise Exception(f"Failed to load supplement data: {str(e)}")

    def get_disease_info(self, disease_name: str) -> Dict:
        """Get detailed information about a specific disease"""
        try:
            disease_info = self.disease_df[self.disease_df['disease_name'].str.lower() == disease_name.lower()].iloc[0]
            
            # Get related supplements
            supplements = self.supplement_df[
                self.supplement_df['disease_name'].str.lower() == disease_name.lower()
            ].to_dict('records')
            
            return {
                "name": disease_info['disease_name'],
                "description": disease_info['description'],
                "symptoms": disease_info['symptoms'],
                "causes": disease_info['causes'],
                "prevention": disease_info['prevention'],
                "treatment": disease_info['treatment'],
                "supplements": supplements
            }
        except Exception as e:
            raise Exception(f"Error getting disease info: {str(e)}")

    def get_all_diseases(self) -> List[Dict]:
        """Get information about all diseases"""
        try:
            return self.disease_df.to_dict('records')
        except Exception as e:
            raise Exception(f"Error getting all diseases: {str(e)}")

    def get_disease_recommendations(self, disease_name: str) -> Dict:
        """Get treatment recommendations for a specific disease"""
        try:
            disease_info = self.get_disease_info(disease_name)
            return {
                "disease": disease_info["name"],
                "treatment": disease_info["treatment"],
                "prevention": disease_info["prevention"],
                "supplements": disease_info["supplements"]
            }
        except Exception as e:
            raise Exception(f"Error getting disease recommendations: {str(e)}")

# Example usage:
if __name__ == "__main__":
    service = DiseaseInfoService()
    
    # Test getting disease info
    try:
        disease_info = service.get_disease_info("Leaf Blight")
        print("Disease Info:", disease_info)
        
        recommendations = service.get_disease_recommendations("Leaf Blight")
        print("\nRecommendations:", recommendations)
    except Exception as e:
        print(f"Error: {str(e)}") 