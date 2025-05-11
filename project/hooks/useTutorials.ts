import { useState, useEffect } from 'react';
import { getTutorials } from '@/services/api';
import { Tutorial } from '@/types';

export function useTutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTutorials = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTutorials();
        setTutorials(data);
      } catch (err) {
        console.error('Error loading tutorials:', err);
        setError('Failed to load tutorials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTutorials();
  }, []);

  return {
    tutorials,
    loading,
    error
  };
}