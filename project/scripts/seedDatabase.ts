import { connectToDatabase, disconnectFromDatabase } from '../config/mongodb';
import { WeatherModel, LocationModel, ForecastModel } from '../models/Weather';
import { CropModel } from '../models/Crop';
import { TutorialModel } from '../models/Tutorial';
import { SchemeModel } from '../models/Scheme';

// Import mock data
import weatherData from '../data/weather.json';
import cropsData from '../data/crops.json';
import tutorialsData from '../data/tutorials.json';
import moreTutorialsData from '../data/tutorials-part2.json';
import schemesData from '../data/schemes.json';

// Combine tutorials from both files
const mockTutorials = [
  ...tutorialsData.mockTutorials,
  ...moreTutorialsData.moreInitialTutorials
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await WeatherModel.deleteMany({});
    await LocationModel.deleteMany({});
    await ForecastModel.deleteMany({});
    await CropModel.deleteMany({});
    await TutorialModel.deleteMany({});
    await SchemeModel.deleteMany({});
    
    // Seed weather data
    console.log('Seeding weather data...');
    await WeatherModel.create(weatherData.mockWeatherData);
    await LocationModel.create(weatherData.mockLocation);
    await ForecastModel.insertMany(weatherData.mockForecast);
    
    // Seed crops data
    console.log('Seeding crops data...');
    await CropModel.insertMany(cropsData.mockCrops);
    
    // Seed tutorials data
    console.log('Seeding tutorials data...');
    await TutorialModel.insertMany(mockTutorials);
    
    // Seed schemes data
    console.log('Seeding schemes data...');
    await SchemeModel.insertMany(schemesData.mockSchemes);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from MongoDB
    await disconnectFromDatabase();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
}

export default seedDatabase; 