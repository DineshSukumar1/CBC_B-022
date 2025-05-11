import mongoose, { Schema } from 'mongoose';
import { Scheme } from '@/types';

// Scheme schema
const schemeSchema = new Schema<Scheme>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  kannadaTitle: { type: String, required: true },
  organization: { type: String, required: true },
  description: { type: String, required: true },
  kannadaDescription: { type: String, required: true },
  benefits: { type: String, required: true },
  kannadaBenefits: { type: String, required: true },
  howToApply: { type: String, required: true },
  kannadaHowToApply: { type: String, required: true },
  type: { type: String, required: true },
  categories: { type: [String], required: true },
  deadline: { type: String, required: false },
  documents: { type: [String], required: false },
  kannadaDocuments: { type: [String], required: false },
});

// Create model if mongoose is available
let SchemeModel: mongoose.Model<Scheme>;

try {
  // Check if model exists
  SchemeModel = mongoose.models.Scheme;
} catch {
  // If model doesn't exist, create it
  SchemeModel = mongoose.model<Scheme>('Scheme', schemeSchema);
}

export { SchemeModel }; 