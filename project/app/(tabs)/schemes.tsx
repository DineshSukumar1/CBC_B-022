import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, TextInput } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { Clover as Government, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSchemes } from '@/hooks/useSchemes';
import { SchemeCard } from '@/components/schemes/SchemeCard';

export default function SchemesScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { schemes, loading, error } = useSchemes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const inputBg = isDark ? '#333333' : '#F5F5F5';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  const categories = ['farmer', 'woman', 'youth', 'senior', 'shg'];
  
  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      scheme.kannadaTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? scheme.categories.includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBg, borderColor }]}>
          <Search size={20} color={textColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={t('searchSchemes')}
            placeholderTextColor={isDark ? '#AAAAAA' : '#757575'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: isDark ? '#333333' : '#FFFFFF', borderColor }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={textColor} />
          {showFilters ? 
            <ChevronUp size={20} color={textColor} /> : 
            <ChevronDown size={20} color={textColor} />
          }
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <Text style={[styles.filtersLabel, { color: textColor }]}>{t('category')}:</Text>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterPill,
                { 
                  backgroundColor: selectedCategory === category ? '#795548' : inputBg,
                  borderColor: borderColor,
                }
              ]}
              onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <Text 
                style={[
                  styles.filterPillText, 
                  { color: selectedCategory === category ? '#FFFFFF' : textColor }
                ]}
              >
                {t(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      <ScrollView style={styles.schemesContainer} contentContainerStyle={styles.schemesContent}>
        {loading ? (
          <Text style={[styles.statusText, { color: textColor }]}>{t('loading')}</Text>
        ) : error ? (
          <Text style={[styles.statusText, { color: textColor }]}>{t('errorLoadingSchemes')}</Text>
        ) : filteredSchemes.length === 0 ? (
          <Text style={[styles.statusText, { color: textColor }]}>{t('noSchemesFound')}</Text>
        ) : (
          filteredSchemes.map(scheme => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 40,
  },
  filterButton: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  filtersLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  schemesContainer: {
    flex: 1,
  },
  schemesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});