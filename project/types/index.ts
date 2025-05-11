export interface Crop {
  id: string;
  name: string;
  name_kn: string;
  description: string;
  description_kn: string;
  season: string;
  season_kn: string;
  soil_type: string;
  soil_type_kn: string;
  water_requirement: string;
  water_requirement_kn: string;
  temperature_range: string;
  temperature_range_kn: string;
  yield: string;
  yield_kn: string;
  market_price: string;
  market_price_kn: string;
  image_url: string;
}

export interface Scheme {
  id: string;
  title: string;
  kannadaTitle: string;
  organization: string;
  description: string;
  kannadaDescription: string;
  benefits: string;
  kannadaBenefits: string;
  howToApply: string;
  kannadaHowToApply: string;
  type: string;
  categories: string[];
  deadline?: string;
  documents?: string[];
  kannadaDocuments?: string[];
}

export interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface WeatherForecast {
  date: string;
  condition: string;
  highTemp: number;
  lowTemp: number;
  rainChance: number;
}

export interface Location {
  name: string;
  region: string;
}

export interface TutorialSlide {
  content: string;
  content_kn: string;
  image_url: string;
}

export interface Tutorial {
  id: string;
  title: string;
  title_kn: string;
  category: string;
  category_kn: string;
  slides: {
    content: string;
    content_kn: string;
    image_url: string;
  }[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  city: string;
  country: string;
  timestamp: string;
}

export interface VoiceResponse {
  text: string;
  audio: string;
}

export interface CropRecommendation {
  name: string;
  description: string;
  optimalTemperature: {
    min: number;
    max: number;
  };
  waterRequirements: string;
  growingSeason: string;
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  image_url: string;
  disease_name: string;
  confidence: number;
  description?: string;
  symptoms: string;
  causes?: string;
  treatment: string;
  prevention: string;
  supplements?: Supplement[];
  alternative_predictions?: AlternativePrediction[];
}

export interface Supplement {
  name: string;
  description: string;
  application: string;
  precautions: string;
}

export interface AlternativePrediction {
  disease: string;
  confidence: number;
}