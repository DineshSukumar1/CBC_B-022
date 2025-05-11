import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useColorScheme, Image } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTutorials } from '@/hooks/useTutorials';
import { TutorialListItem } from '@/components/tutorials/TutorialListItem';
import { useRouter } from 'expo-router';

export default function TutorialsScreen() {
  const { t, language } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { tutorials, loading, error } = useTutorials();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  const categories = [
    { id: 'upi', icon: '💳' },
    { id: 'internet', icon: '🌐' },
    { id: 'mobile', icon: '📱' },
    { id: 'security', icon: '🔒' }
  ];
  
  const filteredTutorials = tutorials.filter(tutorial => 
    selectedCategory ? tutorial.category === selectedCategory : true
  );
  
  const renderCategoryButton = (category: { id: string, icon: string }) => (
    <TouchableOpacity 
      key={category.id}
      style={[
        styles.categoryButton,
        { 
          backgroundColor: selectedCategory === category.id ? '#FF8F00' : cardBg,
          borderColor
        }
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text 
        style={[
          styles.categoryText, 
          { color: selectedCategory === category.id ? '#FFFFFF' : textColor }
        ]}
      >
        {t(category.id)}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <VoiceAssistant smallVersion />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>{t('digitalLiteracy')}</Text>
      </View>
      
      <View style={styles.categoriesContainer}>
        {categories.map(renderCategoryButton)}
      </View>
      
      {loading ? (
        <View style={[styles.statusContainer, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.statusText, { color: textColor }]}>{t('loadingTutorials')}</Text>
        </View>
      ) : error ? (
        <View style={[styles.statusContainer, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.statusText, { color: textColor }]}>{t('errorLoadingTutorials')}</Text>
        </View>
      ) : filteredTutorials.length === 0 ? (
        <View style={[styles.statusContainer, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.statusText, { color: textColor }]}>{t('noTutorialsFound')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTutorials}
          renderItem={({ item }) => (
            <TutorialListItem 
              tutorial={item} 
              onPress={() => router.push(`/tutorial/${item.id}`)} 
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 68,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusContainer: {
    margin: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
});