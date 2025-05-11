import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from './useTranslation';
import * as Speech from 'expo-speech';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { language } = useTranslation();
  
  const speak = useCallback(async (text: string) => {
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        // Web implementation using Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on current app language
        utterance.lang = language === 'en' ? 'en-US' : 'kn-IN';
        
        // Optional: adjust speech rate and pitch
        utterance.rate = 0.9; // slightly slower
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Native implementation using Expo Speech
        setIsSpeaking(true);
        await Speech.speak(text, {
          language: language === 'en' ? 'en-US' : 'kn-IN',
          rate: 0.9,
          pitch: 1,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (error) {
      console.error('Error using speech synthesis:', error);
      setIsSpeaking(false);
    }
  }, [language]);
  
  const stop = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        await Speech.stop();
      }
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
      setIsSpeaking(false);
    }
  }, []);
  
  return {
    speak,
    stop,
    isSpeaking,
  };
}