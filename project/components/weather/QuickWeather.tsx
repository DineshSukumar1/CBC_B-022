import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { CloudRain, ChevronRight } from 'lucide-react-native';
import { useWeather } from '@/hooks/useWeather';
import { useRouter } from 'expo-router';

export function QuickWeather() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { currentWeather, location, loading, error } = useWeather();
  const router = useRouter();
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: cardBg, borderColor }]}
      onPress={() => router.push('/weather')}
    >
      {loading ? (
        <Text style={[styles.loadingText, { color: textColor }]}>{t('loadingWeather')}</Text>
      ) : error ? (
        <View style={styles.errorContent}>
          <Text style={[styles.errorText, { color: textColor }]}>{t('weatherError')}</Text>
          <Text style={[styles.errorSubText, { color: isDark ? '#BBBBBB' : '#666666' }]}>
            {t('tapToRetry')}
          </Text>
        </View>
      ) : currentWeather ? (
        <View style={styles.weatherContent}>
          <View style={styles.weatherInfo}>
            <Text style={[styles.location, { color: isDark ? '#BBBBBB' : '#666666' }]}>
              {location ? location.name : t('yourLocation')}
            </Text>
            <Text style={[styles.temperature, { color: textColor }]}>
              {currentWeather.temperature}°C
            </Text>
            <Text style={[styles.condition, { color: textColor }]}>
              {t(currentWeather.condition)}
            </Text>
          </View>
          
          <View style={styles.rightSection}>
            <CloudRain size={32} color={isDark ? '#BBBBBB' : '#666666'} />
            <ChevronRight size={20} color={isDark ? '#BBBBBB' : '#666666'} style={styles.chevron} />
          </View>
        </View>
      ) : (
        <Text style={[styles.noDataText, { color: textColor }]}>{t('tapForWeather')}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  errorSubText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  location: {
    fontSize: 14,
    marginBottom: 4,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '600',
  },
  condition: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    marginTop: 8,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
  },
});