import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { CloudRain, CloudSun, Cloud, Sun } from 'lucide-react-native';
import { WeatherForecast } from '@/types';

interface WeatherForecastCardProps {
  forecast: WeatherForecast;
}

export function WeatherForecastCard({ forecast }: WeatherForecastCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rainy':
        return <CloudRain size={24} color="#0288D1" />;
      case 'cloudy':
        return <Cloud size={24} color="#757575" />;
      case 'partly cloudy':
        return <CloudSun size={24} color="#FFC107" />;
      case 'sunny':
        return <Sun size={24} color="#FF9800" />;
      default:
        return <Cloud size={24} color="#757575" />;
    }
  };
  
  const getDayName = (dateString: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = new Date(dateString);
    return t(days[date.getDay()]);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.day, { color: textColor }]}>{getDayName(forecast.date)}</Text>
        <Text style={[styles.date, { color: isDark ? '#BBBBBB' : '#666666' }]}>{forecast.date}</Text>
      </View>
      
      <View style={styles.middleSection}>
        {getWeatherIcon(forecast.condition)}
        <Text style={[styles.condition, { color: textColor }]}>{t(forecast.condition)}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={[styles.highTemp, { color: textColor }]}>{forecast.highTemp}°</Text>
        <Text style={[styles.lowTemp, { color: isDark ? '#BBBBBB' : '#666666' }]}>{forecast.lowTemp}°</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  leftSection: {
    flex: 1,
  },
  day: {
    fontSize: 16,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  condition: {
    fontSize: 14,
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highTemp: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  lowTemp: {
    fontSize: 16,
  },
});