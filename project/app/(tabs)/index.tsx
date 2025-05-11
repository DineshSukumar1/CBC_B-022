import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, useColorScheme } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { CloudRain, Clover as Government, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { QuickWeather } from '@/components/weather/QuickWeather';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const cardBorder = isDark ? '#333333' : '#E0E0E0';
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: textColor }]}>{t('welcome')}</Text>
        <LanguageToggle />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        <QuickWeather />
        
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('features')}</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => router.push('/weather')}
            >
              <CloudRain size={36} color="#0288D1" />
              <Text style={[styles.featureTitle, { color: textColor }]}>{t('weatherAlerts')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => router.push('/schemes')}
            >
              <Government size={36} color="#795548" />
              <Text style={[styles.featureTitle, { color: textColor }]}>{t('govSchemes')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => router.push('/disease-detection')}
            >
              <BookOpen size={36} color="#FF8F00" />
              <Text style={[styles.featureTitle, { color: textColor }]}>{t('diseaseDetection')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => router.push('/tutorials')}
            >
              <BookOpen size={36} color="#FF8F00" />
              <Text style={[styles.featureTitle, { color: textColor }]}>{t('digitalLiteracy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tipContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('dailyTip')}</Text>
          <View style={[styles.tipCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.tipText, { color: textColor }]}>{t('tipContent')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  featuresContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tipContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});