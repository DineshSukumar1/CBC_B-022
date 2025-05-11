import pandas as pd
import pymongo
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def seed_database():
    # Connect to MongoDB
    client = pymongo.MongoClient(os.getenv("MONGODB_URI"))
    db = client["farm_assistant"]
    
    # Get the correct path to crops.csv
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    csv_path = os.path.join(project_root, 'data', 'crops.csv')
    
    # Read CSV file
    crops_df = pd.read_csv(csv_path)
    
    # Convert DataFrame to list of dictionaries
    crops_data = crops_df.to_dict("records")
    
    # Clear existing data
    db.crops.delete_many({})
    
    # Insert new data
    if crops_data:
        db.crops.insert_many(crops_data)
        print(f"Successfully seeded {len(crops_data)} crops into the database")
    else:
        print("No data to seed")

if __name__ == "__main__":
    seed_database() 