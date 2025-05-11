import { Scheme } from '@/types';
import { getSchemes, getSchemeById, getSchemesByCategory } from '../services/schemeService';

// Export async functions that will be used throughout the app
export const fetchSchemes = async (): Promise<Scheme[]> => {
  return await getSchemes();
};

export const fetchSchemeById = async (id: string): Promise<Scheme | undefined> => {
  return await getSchemeById(id);
};

export const fetchSchemesByCategory = async (category: string): Promise<Scheme[]> => {
  return await getSchemesByCategory(category);
};