import mongoose, { Schema } from 'mongoose';
import { Tutorial } from '@/types';

// Tutorial slide schema
const slideSchema = new Schema({
  content: { type: String, required: true },
  content_kn: { type: String, required: true },
  image_url: { type: String, required: true },
});

// Tutorial schema
const tutorialSchema = new Schema<Tutorial>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  title_kn: { type: String, required: true },
  category: { type: String, required: true },
  category_kn: { type: String, required: true },
  slides: { type: [slideSchema], required: true },
});

// Create model if mongoose is available
export const TutorialModel = mongoose.models.Tutorial || 
  mongoose.model<Tutorial>('Tutorial', tutorialSchema); 