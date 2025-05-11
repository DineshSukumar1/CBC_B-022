import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { getWeather, getCropRecommendations, getMLCropRecommendations } from '@/services/api';
import { WeatherData, CropRecommendation } from '@/types';

export function useWeather() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedCrops, setRecommendedCrops] = useState<CropRecommendation[]>([]);
  const [usingMLModel, setUsingMLModel] = useState(true);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to get weather data');
        setLoading(false);
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to request location permission');
      setLoading(false);
      return false;
    }
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);

      // Fetch weather data
      const weatherData = await getWeather(location.coords.latitude, location.coords.longitude);
      setCurrentWeather(weatherData);

      // Get crop recommendations using ML model
      if (weatherData) {
        try {
          // Add coordinates to weather data for region-based recommendations
          const weatherWithCoords = {
            ...weatherData,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          };
          
          // Try to get ML-based recommendations first
          const mlRecommendations = await getMLCropRecommendations(weatherWithCoords);
          setRecommendedCrops(mlRecommendations);
          setUsingMLModel(true);
          console.log('Using ML-based crop recommendations');
        } catch (err) {
          console.error('Error getting ML crop recommendations:', err);
          
          // Fall back to rule-based recommendations
          console.log('Falling back to rule-based crop recommendations');
          const fallbackRecommendations = await getCropRecommendations(weatherData);
          setRecommendedCrops(fallbackRecommendations);
          setUsingMLModel(false);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const refreshWeather = () => {
    fetchWeatherData();
  };

  return {
    currentWeather,
    forecastData,
    location,
    loading,
    error,
    recommendedCrops,
    refreshWeather,
    usingMLModel,
  };
}