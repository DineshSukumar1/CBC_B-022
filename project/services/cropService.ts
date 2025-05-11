import { Crop } from '@/types';
import { connectToDatabase } from '../config/mongodb';
import { CropModel } from '../models/Crop';

// Fallback mock data (in case MongoDB connection fails)
import cropsData from '../data/crops.json';

export async function getCrops(): Promise<Crop[]> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const crops = await CropModel.find().lean();
    
    if (crops && crops.length > 0) {
      return crops;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return cropsData.mockCrops;
  } catch (error) {
    console.error('Error fetching crop data:', error);
    // Fallback to mock data on error
    return cropsData.mockCrops;
  }
}

export async function getCropById(id: string): Promise<Crop | undefined> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const crop = await CropModel.findOne({ id }).lean();
    
    if (crop) {
      return crop;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return cropsData.mockCrops.find(crop => crop.id === id);
  } catch (error) {
    console.error(`Error fetching crop with id ${id}:`, error);
    // Fallback to mock data on error
    return cropsData.mockCrops.find(crop => crop.id === id);
  }
} 