import { CurrentWeather, WeatherForecast, Location } from '@/types';
import { connectToDatabase } from '../config/mongodb';
import { WeatherModel, LocationModel, ForecastModel } from '../models/Weather';

// Fallback mock data (in case MongoDB connection fails)
import weatherData from '../data/weather.json';

export async function getWeatherData(): Promise<CurrentWeather> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const weatherData = await WeatherModel.findOne().lean();
    
    if (weatherData) {
      return weatherData;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return weatherData.mockWeatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data on error
    return weatherData.mockWeatherData;
  }
}

export async function getLocation(): Promise<Location> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const location = await LocationModel.findOne().lean();
    
    if (location) {
      return location;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return weatherData.mockLocation;
  } catch (error) {
    console.error('Error fetching location data:', error);
    // Fallback to mock data on error
    return weatherData.mockLocation;
  }
}

export async function getForecast(): Promise<WeatherForecast[]> {
  try {
    // Try to get data from MongoDB
    await connectToDatabase();
    const forecast = await ForecastModel.find().lean();
    
    if (forecast && forecast.length > 0) {
      return forecast;
    }
    
    // Fallback to mock data if no data found in MongoDB
    return weatherData.mockForecast;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    // Fallback to mock data on error
    return weatherData.mockForecast;
  }
} 