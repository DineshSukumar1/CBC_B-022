import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from '@/components/WeatherCard';
import { CropRecommendationCard } from '@/components/CropRecommendationCard';
import { useTranslation } from '@/hooks/useTranslation';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

export default function WeatherScreen() {
  const { t } = useTranslation();
  const { currentWeather, error, recommendedCrops, refreshWeather, loading, usingMLModel } = useWeather();

  const handleRefresh = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('Location Permission Required'),
          t('Please enable location access to get weather data'),
          [
            { text: t('Cancel'), style: 'cancel' },
            { 
              text: t('Open Settings'),
              onPress: () => Location.openSettings()
            }
          ]
        );
        return;
      }
      refreshWeather();
    } catch (err) {
      Alert.alert(
        t('Error'),
        t('Failed to refresh weather data. Please try again.'),
        [{ text: t('OK') }]
      );
    }
  };

  const getWeatherGradient = () => {
    if (!currentWeather) return ['#1E1E1E', '#2D2D2D'];
    const condition = currentWeather.description.toLowerCase();
    if (condition.includes('rain')) return ['#2C3E50', '#3498DB'];
    if (condition.includes('cloud')) return ['#2C3E50', '#7F8C8D'];
    if (condition.includes('clear')) return ['#1A2980', '#26D0CE'];
    return ['#1E1E1E', '#2D2D2D'];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getWeatherGradient()}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{t('Weather')}</Text>
              <Text style={styles.subtitle}>{currentWeather?.city || t('yourLocation')}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>{t('Retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : loading && !currentWeather ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>{t('Loading weather data...')}</Text>
            </View>
          ) : currentWeather ? (
            <>
              <WeatherCard weather={currentWeather} />
              
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{t('Recommended Crops')}</Text>
                  {usingMLModel && (
                    <View style={styles.mlBadge}>
                      <MaterialIcons name="auto-awesome" size={16} color="#FFFFFF" style={styles.mlIcon} />
                      <Text style={styles.mlBadgeText}>ML</Text>
                    </View>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
                  {recommendedCrops.map((crop, index) => (
                    <View key={index} style={styles.cropCardContainer}>
                      <CropRecommendationCard crop={crop} />
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.weatherTipsContainer}>
                <Text style={styles.weatherTipsTitle}>{t('weatherTips')}</Text>
                <Text style={styles.weatherTipsContent}>{t('weatherTipsContent')}</Text>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <MaterialIcons name="cloud-off" size={48} color="#BBBBBB" />
              <Text style={styles.noDataText}>{t('No weather data available')}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>{t('Get Weather Data')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBBBBB',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  mlIcon: {
    marginRight: 4,
  },
  mlBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cropsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  cropCardContainer: {
    marginRight: 16,
    width: 280,
  },
  weatherTipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  weatherTipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  weatherTipsContent: {
    fontSize: 14,
    color: '#BBBBBB',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});