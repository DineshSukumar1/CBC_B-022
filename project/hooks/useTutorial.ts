import { useState, useEffect } from 'react';
import { Tutorial } from '@/types';
import { getTutorials } from '@/services/api';

export function useTutorial(id?: string) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) {
      setError('Tutorial ID is required');
      setLoading(false);
      return;
    }
    
    const loadTutorial = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tutorials = await getTutorials();
        const found = tutorials.find(t => t.id === id);
        
        if (found) {
          setTutorial(found);
        } else {
          setError('Tutorial not found');
        }
      } catch (err) {
        console.error('Error loading tutorial:', err);
        setError('Failed to load tutorial. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTutorial();
  }, [id]);
  
  return { tutorial, loading, error };
}