import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import { detectDisease } from '@/services/api';
import { DetectionResult } from '@/types';

// Get the API URL from environment variables or use a default
const API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',  // Android emulator
  ios: 'http://localhost:8000/api',     // iOS simulator
  default: 'http://localhost:8000/api'  // Web and others
});

export default function DiseaseDetectionScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('Permission Required'),
            t('Sorry, we need camera roll permissions to make this work!'),
            [{ text: t('OK') }]
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null); // Clear previous result when new image is selected
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('Error'),
        t('Failed to pick image. Please try again.'),
        [{ text: t('OK') }]
      );
    }
  };

  const analyzeDisease = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await detectDisease(image);
      if (data) {
        console.log('Detection result:', data);
        setResult(data);
      } else {
        throw new Error('Failed to detect disease');
      }
    } catch (err) {
      console.error('Error detecting disease:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect disease');
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to detect disease',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.uploadSection}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <MaterialIcons name="photo-library" size={24} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.uploadButtonText}>{t('uploadImage')}</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity 
            style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]} 
            onPress={analyzeDisease}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialIcons name="search" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.analyzeButtonText}>{t('analyze')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>{t('analyzing')}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{t('detectionResult')}</Text>
          <Text style={styles.diseaseName}>{result.disease_name}</Text>
          <Text style={styles.confidence}>
            {t('confidence')}: {result.confidence.toFixed(2)}%
          </Text>
          
          {result.description && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('description')}</Text>
              <Text style={styles.infoText}>{result.description}</Text>
            </View>
          )}

          {result.symptoms && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('symptoms')}</Text>
              <Text style={styles.infoText}>{result.symptoms}</Text>
            </View>
          )}

          {result.causes && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('causes')}</Text>
              <Text style={styles.infoText}>{result.causes}</Text>
            </View>
          )}

          {result.treatment && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('treatment')}</Text>
              <Text style={styles.infoText}>{result.treatment}</Text>
            </View>
          )}

          {result.prevention && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('prevention')}</Text>
              <Text style={styles.infoText}>{result.prevention}</Text>
            </View>
          )}

          {result.supplements && result.supplements.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('recommendedSupplements')}</Text>
              {result.supplements.map((supplement, index) => (
                <View key={index} style={styles.supplementItem}>
                  <Text style={styles.supplementName}>{supplement.name}</Text>
                  <Text style={styles.supplementDesc}>{supplement.description}</Text>
                  <Text style={styles.supplementInfo}>{t('application')}: {supplement.application}</Text>
                  <Text style={styles.supplementInfo}>{t('precautions')}: {supplement.precautions}</Text>
                </View>
              ))}
            </View>
          )}

          {result.alternative_predictions && result.alternative_predictions.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('alternativePredictions')}</Text>
              {result.alternative_predictions.map((prediction, index) => (
                <Text key={index} style={styles.alternativePrediction}>
                  • {prediction.disease}: {prediction.confidence.toFixed(2)}%
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  uploadSection: {
    padding: 20,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#388E3C',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  imageContainer: {
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  analyzeButton: {
    backgroundColor: '#388E3C',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  diseaseName: {
    fontSize: 18,
    color: '#388E3C',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  infoSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  supplementItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  supplementName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 3,
  },
  supplementDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  supplementInfo: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },
  alternativePrediction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  errorContainer: {
    padding: 20,
    margin: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  }
}); 