import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, ThermometerSun, Droplets, Wind } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { WeatherData } from '@/types';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {weather.city}, {weather.country}
          </Text>
          <Text style={styles.subtitle}>
            {new Date(weather.timestamp).toLocaleString()}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={24} color="#FFFFFF" />
        ) : (
          <ChevronDown size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.details}>
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.description}>
              {t(weather.description.toLowerCase())}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Droplets size={20} color="#BBBBBB" />
              <Text style={styles.infoLabel}>
                {t('humidity')}:
              </Text>
              <Text style={styles.infoValue}>
                {weather.humidity}%
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Wind size={20} color="#BBBBBB" />
              <Text style={styles.infoLabel}>
                {t('wind')}:
              </Text>
              <Text style={styles.infoValue}>
                {weather.windSpeed} m/s
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444444',
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    color: '#BBBBBB',
  },
  details: {
    padding: 16,
    paddingTop: 0,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginTop: 4,
    color: '#BBBBBB',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: '#444444',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
    color: '#BBBBBB',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
}); 