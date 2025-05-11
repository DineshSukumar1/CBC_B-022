import { CurrentWeather, WeatherForecast, Location } from '@/types';
import { getWeatherData, getLocation, getForecast } from '../services/weatherService';

// Export async functions that will be used throughout the app
export const fetchWeatherData = async (): Promise<CurrentWeather> => {
  return await getWeatherData();
};

export const fetchLocation = async (): Promise<Location> => {
  return await getLocation();
};

export const fetchForecast = async (): Promise<WeatherForecast[]> => {
  return await getForecast();
};