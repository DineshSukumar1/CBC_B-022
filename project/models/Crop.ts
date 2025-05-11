import mongoose, { Schema } from 'mongoose';
import { Crop } from '@/types';

// Crop schema
const cropSchema = new Schema<Crop>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  name_kn: { type: String, required: true },
  description: { type: String, required: true },
  description_kn: { type: String, required: true },
  season: { type: String, required: true },
  season_kn: { type: String, required: true },
  soil_type: { type: String, required: true },
  soil_type_kn: { type: String, required: true },
  water_requirement: { type: String, required: true },
  water_requirement_kn: { type: String, required: true },
  temperature_range: { type: String, required: true },
  temperature_range_kn: { type: String, required: true },
  yield: { type: String, required: true },
  yield_kn: { type: String, required: true },
  market_price: { type: String, required: true },
  market_price_kn: { type: String, required: true },
  image_url: { type: String, required: true },
});

// Create model if mongoose is available
export const CropModel = mongoose.models.Crop || 
  mongoose.model<Crop>('Crop', cropSchema); 