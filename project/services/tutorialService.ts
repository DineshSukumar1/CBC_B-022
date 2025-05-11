import { Tutorial } from '@/types';
import { connectToDatabase } from '../config/mongodb';
import { TutorialModel } from '../models/Tutorial';

// Fallback mock data (in case MongoDB connection fails)
import tutorialsData from '../data/tutorials.json';
import moreTutorialsData from '../data/tutorials-part2.json';

// Combine tutorials from both files for fallback
const mockTutorials = [
  ...tutorialsData.mockTutorials,
  ...moreTutorialsData.moreInitialTutorials
];

export async function getTutorials(): Promise<Tutorial[]> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const tutorials = await TutorialModel.find().lean();
    
    if (tutorials && tutorials.length > 0) {
      return tutorials;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return mockTutorials;
  } catch (error) {
    console.error('Error fetching tutorial data:', error);
    // Fallback to mock data on error
    return mockTutorials;
  }
}

export async function getTutorialById(id: string): Promise<Tutorial | undefined> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const tutorial = await TutorialModel.findOne({ id }).lean();
    
    if (tutorial) {
      return tutorial;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return mockTutorials.find(tutorial => tutorial.id === id);
  } catch (error) {
    console.error(`Error fetching tutorial with id ${id}:`, error);
    // Fallback to mock data on error
    return mockTutorials.find(tutorial => tutorial.id === id);
  }
}

export async function getTutorialsByCategory(category: string): Promise<Tutorial[]> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const tutorials = await TutorialModel.find({ category }).lean();
    
    if (tutorials && tutorials.length > 0) {
      return tutorials;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return mockTutorials.filter(tutorial => tutorial.category === category);
  } catch (error) {
    console.error(`Error fetching tutorials with category ${category}:`, error);
    // Fallback to mock data on error
    return mockTutorials.filter(tutorial => tutorial.category === category);
  }
} 