import mongoose, { Schema } from 'mongoose';
import { WeatherData } from '@/types';

// Weather data schema
const weatherSchema = new Schema<WeatherData>({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  rainfall: { type: Number, required: true },
  soil_moisture: { type: Number, required: true },
  location: { type: String, required: true },
  timestamp: { type: String, required: true },
});

// Create model if mongoose is available
export const WeatherModel = mongoose.models.Weather || 
  mongoose.model<WeatherData>('Weather', weatherSchema); 