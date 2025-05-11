import { Crop, WeatherData, CropRecommendation, Tutorial, DetectionResult } from '@/types';

// Use the environment variable with /api endpoint
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.63.239:8000/api';

// Add retry logic for network requests
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0 && isNetworkError(error)) {
      console.log(`Retrying request to ${url}, ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

const isNetworkError = (error: any) => {
  return error instanceof TypeError && error.message === 'Network request failed';
};

const handleApiError = (error: any, fallbackData: any) => {
  console.error('API Error:', error);
  if (isNetworkError(error)) {
    console.log('Network error, using fallback data');
  }
  return fallbackData;
};

export async function getCrops(): Promise<Crop[]> {
  try {
    const response = await fetchWithRetry(`${API_URL}/crops`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error, []);
  }
}

export async function getWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
  try {
    const response = await fetchWithRetry(`${API_URL}/weather?lat=${latitude}&lon=${longitude}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error, null);
  }
}

export async function getCropRecommendations(weatherData: WeatherData): Promise<CropRecommendation[]> {
  try {
    const response = await fetchWithRetry(`${API_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(weatherData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error, []);
  }
}

export async function getMLCropRecommendations(weatherData: WeatherData): Promise<CropRecommendation[]> {
  try {
    console.log('Getting ML crop recommendations with data:', weatherData);
    const response = await fetchWithRetry(`${API_URL}/ml-crop-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(weatherData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('ML crop recommendations received:', data);
    return data;
  } catch (error) {
    console.error('Error getting ML crop recommendations:', error);
    // If ML recommendations fail, fall back to regular recommendations
    console.log('Falling back to regular crop recommendations');
    return getCropRecommendations(weatherData);
  }
}

export async function getTutorials(): Promise<Tutorial[]> {
  try {
    // Import tutorials data directly from the local file
    const tutorialsData = require('../data/tutorials.json');
    const moreTutorialsData = require('../data/tutorials-part2.json');
    
    // Combine tutorials from both files and transform to match the interface
    const allTutorials = [
      ...(tutorialsData.mockTutorials || []),
      ...(moreTutorialsData.moreInitialTutorials || [])
    ];

    // Import Kannada translations for categories
    const { kn } = require('../translations/kn');

    // Transform the data to match the Tutorial interface
    return allTutorials.map(tutorial => ({
      id: tutorial.id || '',
      title: tutorial.title || '',
      title_kn: tutorial.kannadaTitle || '',
      category: tutorial.category || '',
      category_kn: tutorial.category ? kn[tutorial.category] || tutorial.category : '', // Use Kannada translation if available
      slides: (tutorial.slides || []).map(slide => ({
        content: slide.content || '',
        content_kn: slide.kannadaContent || '',
        image_url: slide.imageUrl || ''
      }))
    }));
  } catch (error) {
    console.error('Error loading tutorials:', error);
    return [];
  }
}

export async function processVoiceInput(audioData: string): Promise<string> {
  try {
    const response = await fetchWithRetry(`${API_URL}/voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio: audioData }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    return handleApiError(error, 'Sorry, I could not process your request at this time.');
  }
}

export async function detectDisease(imageUri: string): Promise<DetectionResult | null> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    console.log('Sending request to:', `${API_URL}/detect-disease`);
    console.log('Form data:', formData);

    const response = await fetchWithRetry(`${API_URL}/detect-disease`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to detect disease');
    }

    const data = await response.json();
    console.log('Detection result:', data);
    return data;
  } catch (error) {
    return handleApiError(error, null);
  }
} 