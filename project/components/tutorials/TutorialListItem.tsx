import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { Tutorial } from '@/types';

interface TutorialListItemProps {
  tutorial: Tutorial;
  onPress: () => void;
}

export function TutorialListItem({ tutorial, onPress }: TutorialListItemProps) {
  const { t, language } = useTranslation();
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'upi':
        return '💳';
      case 'internet':
        return '🌐';
      case 'mobile':
        return '📱';
      case 'security':
        return '🔒';
      default:
        return '📚';
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: cardBg, borderColor }]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{getCategoryEmoji(tutorial.category)}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          {language === 'en' ? tutorial.title : tutorial.title_kn}
        </Text>
        <Text style={[styles.info, { color: isDark ? '#BBBBBB' : '#666666' }]}>
          {language === 'en' ? t(tutorial.category) : tutorial.category_kn} • {tutorial.slides.length} {t('slides')}
        </Text>
      </View>
      
      <ChevronRight size={20} color={isDark ? '#BBBBBB' : '#666666'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
  },
});