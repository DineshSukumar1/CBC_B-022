import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CropRecommendation } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface CropRecommendationCardProps {
  crop: CropRecommendation;
}

export function CropRecommendationCard({ crop }: CropRecommendationCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="grass" size={24} color="#4CAF50" />
        <Text style={styles.title}>{crop.name}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialIcons name="thermostat" size={20} color="#666" />
          <Text style={styles.detailText}>
            {t('Optimal Temperature')}: {crop.optimalTemperature.min}°C - {crop.optimalTemperature.max}°C
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="water-drop" size={20} color="#666" />
          <Text style={styles.detailText}>
            {t('Water Requirements')}: {crop.waterRequirements}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={20} color="#666" />
          <Text style={styles.detailText}>
            {t('Growing Season')}: {crop.growingSeason}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{crop.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 