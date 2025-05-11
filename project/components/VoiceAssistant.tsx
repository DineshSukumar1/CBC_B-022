import { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { processVoiceInput } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

interface VoiceAssistantProps {
  smallVersion?: boolean;
}

export function VoiceAssistant({ smallVersion = false }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  async function startRecording() {
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
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

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
            // Play the response audio
            const { sound } = await Audio.Sound.createAsync(
              { uri: `data:audio/mp3;base64,${result.audio}` },
              { shouldPlay: true }
            );
            await sound.playAsync();
          } catch (err) {
            console.error('Failed to process voice input', err);
          } finally {
            setIsProcessing(false);
          }
        };
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsProcessing(false);
    }
  }

  return (
    <View style={[styles.container, smallVersion && styles.smallContainer]}>
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.recordingButton,
          smallVersion && styles.smallButton,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : isRecording ? (
          <MicOff size={smallVersion ? 20 : 24} color="#FFFFFF" />
        ) : (
          <Mic size={smallVersion ? 20 : 24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      {!smallVersion && (
        <Text style={styles.label}>
          {isRecording ? t('tapToStop') : t('tapToSpeak')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  smallContainer: {
    padding: 8,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
});