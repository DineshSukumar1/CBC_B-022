import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, useColorScheme } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? '#333333' : '#FFFFFF',
          borderColor: isDark ? '#444444' : '#E0E0E0',
        }
      ]} 
      onPress={toggleLanguage}
    >
      <View style={styles.flagContainer}>
        <Text style={styles.flagEmoji}>{language === 'en' ? '🇬🇧' : '🇮🇳'}</Text>
      </View>
      <Text style={[styles.text, { color: isDark ? '#FFFFFF' : '#333333' }]}>
        {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  flagContainer: {
    marginRight: 4,
  },
  flagEmoji: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});