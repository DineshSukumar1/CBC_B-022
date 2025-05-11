import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronDown, ChevronUp, FileText, Users, Calendar } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { Scheme } from '@/types';

interface SchemeCardProps {
  scheme: Scheme;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const { t, language } = useTranslation();
  const colorScheme = useColorScheme();
  const [expanded, setExpanded] = useState(false);
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            {language === 'en' ? scheme.title : scheme.kannadaTitle}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#BBBBBB' : '#666666' }]}>
            {scheme.organization} | {scheme.categories.map(c => t(c)).join(', ')}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={24} color={textColor} />
        ) : (
          <ChevronDown size={24} color={textColor} />
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.details}>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <FileText size={20} color={isDark ? '#BBBBBB' : '#666666'} />
              <Text style={[styles.infoLabel, { color: isDark ? '#BBBBBB' : '#666666' }]}>
                {t('schemeType')}:
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {t(scheme.type)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Users size={20} color={isDark ? '#BBBBBB' : '#666666'} />
              <Text style={[styles.infoLabel, { color: isDark ? '#BBBBBB' : '#666666' }]}>
                {t('eligibility')}:
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {scheme.categories.map(c => t(c)).join(', ')}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={20} color={isDark ? '#BBBBBB' : '#666666'} />
              <Text style={[styles.infoLabel, { color: isDark ? '#BBBBBB' : '#666666' }]}>
                {t('deadline')}:
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {scheme.deadline || t('noDeadline')}
              </Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('description')}</Text>
          <Text style={[styles.description, { color: textColor }]}>
            {language === 'en' ? scheme.description : scheme.kannadaDescription}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('benefits')}</Text>
          <Text style={[styles.description, { color: textColor }]}>
            {language === 'en' ? scheme.benefits : scheme.kannadaBenefits}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: textColor }]}>{t('howToApply')}</Text>
          <Text style={[styles.description, { color: textColor }]}>
            {language === 'en' ? scheme.howToApply : scheme.kannadaHowToApply}
          </Text>
          
          {scheme.documents && scheme.documents.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: textColor }]}>{t('requiredDocuments')}</Text>
              <View style={styles.documentsList}>
                {scheme.documents.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <Text style={[styles.bulletPoint, { color: textColor }]}>•</Text>
                    <Text style={[styles.documentText, { color: textColor }]}>
                      {language === 'en' ? doc : scheme.kannadaDocuments?.[index] || doc}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
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
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  details: {
    padding: 16,
    paddingTop: 0,
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
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  documentsList: {
    marginTop: 4,
  },
  documentItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
    fontSize: 16,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});