import { Scheme } from '@/types';
import { connectToDatabase } from '../config/mongodb';
import { SchemeModel } from '../models/Scheme';

// Fallback mock data (in case MongoDB connection fails)
import schemesData from '../data/schemes.json';

const isNetworkError = (error: any) => {
  return error instanceof TypeError && error.message === 'Network request failed';
};

export async function getSchemes(): Promise<Scheme[]> {
  try {
    // Try to get data from MongoDB
    const connection = await connectToDatabase();
    if (!connection) {
      throw new Error('Failed to connect to database');
    }

    const schemes = await SchemeModel.find().lean();
    
    if (schemes && schemes.length > 0) {
      return schemes;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return schemesData.mockSchemes;
  } catch (error) {
    console.error('Error fetching scheme data:', error);
    if (isNetworkError(error)) {
      console.log('Network error, using mock data');
    }
    // Fallback to mock data on error
    return schemesData.mockSchemes;
  }
}

export async function getSchemeById(id: string): Promise<Scheme | undefined> {
  try {
    // Try to get data from MongoDB
    const connection = await connectToDatabase();
    if (!connection) {
      throw new Error('Failed to connect to database');
    }

    const scheme = await SchemeModel.findOne({ id }).lean();
    
    if (scheme) {
      return scheme;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return schemesData.mockSchemes.find(scheme => scheme.id === id);
  } catch (error) {
    console.error(`Error fetching scheme with id ${id}:`, error);
    if (isNetworkError(error)) {
      console.log('Network error, using mock data');
    }
    // Fallback to mock data on error
    return schemesData.mockSchemes.find(scheme => scheme.id === id);
  }
}

export async function getSchemesByCategory(category: string): Promise<Scheme[]> {
  try {
    // Try to get data from MongoDB
    const connection = await connectToDatabase();
    if (!connection) {
      throw new Error('Failed to connect to database');
    }

    const schemes = await SchemeModel.find({ categories: category }).lean();
    
    if (schemes && schemes.length > 0) {
      return schemes;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return schemesData.mockSchemes.filter(scheme => scheme.categories.includes(category));
  } catch (error) {
    console.error(`Error fetching schemes with category ${category}:`, error);
    if (isNetworkError(error)) {
      console.log('Network error, using mock data');
    }
    // Fallback to mock data on error
    return schemesData.mockSchemes.filter(scheme => scheme.categories.includes(category));
  }
} 