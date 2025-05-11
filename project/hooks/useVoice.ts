import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from './useTranslation';
import { Audio } from 'expo-av';
import { processVoiceInput } from '@/services/api';

// Mock implementation for web - in a real app, you would use a real speech recognition API
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const router = useRouter();
  const { t, language } = useTranslation();
  
  const startListening = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  }, []);
  
  const stopListening = useCallback(async () => {
    if (!recording) return;

    try {
      setProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsListening(false);

      if (uri) {
        // Convert audio file to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];

          try {
            const result = await processVoiceInput(base64Audio);
            setTranscript(result.text);
            
            // Play the response audio
            const { sound } = await Audio.Sound.createAsync(
              { uri: `data:audio/mp3;base64,${result.audio}` },
              { shouldPlay: true }
            );
            await sound.playAsync();
          } catch (err) {
            console.error('Failed to process voice input', err);
            Alert.alert('Error', 'Failed to process voice input');
          } finally {
            setProcessing(false);
          }
        };
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setProcessing(false);
      Alert.alert('Error', 'Failed to stop voice recording');
    }
  }, [recording]);
  
  const processCommand = useCallback((command: string) => {
    if (!command) return;
    
    setProcessing(true);
    
    // Simple command processing logic
    const lowerCommand = command.toLowerCase();
    
    setTimeout(() => {
      if (lowerCommand.includes('crop') || lowerCommand.includes('ಬೆಳೆ')) {
        router.push('/crops');
      } else if (lowerCommand.includes('scheme') || lowerCommand.includes('ಯೋಜನೆ')) {
        router.push('/tutorials');
      } else if (lowerCommand.includes('weather') || lowerCommand.includes('ಹವಾಮಾನ')) {
        router.push('/weather');
      } else if (lowerCommand.includes('tutorial') || lowerCommand.includes('digital') || lowerCommand.includes('ಡಿಜಿಟಲ್')) {
        router.push('/tutorials');
      } else {
        // Default to home if command not recognized
        router.push('/');
      }
      
      setProcessing(false);
      setTranscript('');
    }, 1000);
  }, [router]);
  
  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    processCommand,
    processing,
  };
}