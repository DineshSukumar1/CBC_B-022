import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scheme } from '@/types';
import { fetchSchemes } from '@/data/mockSchemes';

const CACHE_KEY = 'schemes_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function useSchemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemesData();
  }, []);

  const fetchSchemesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached data first
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setSchemes(data);
          setLoading(false);
          return;
        }
      }

      // If no cache or expired, fetch from API
      const data = await fetchSchemes();
      setSchemes(data);

      // Cache the new data
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Failed to load schemes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchemes = () => {
    return fetchSchemesData();
  };

  return {
    schemes,
    loading,
    error,
    refreshSchemes
  };
}