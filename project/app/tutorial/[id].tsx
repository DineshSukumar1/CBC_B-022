import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView, SafeAreaView, Image } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTutorial } from '@/hooks/useTutorial';
import { Stack } from 'expo-router';
import { useSpeech } from '@/hooks/useSpeech';

export default function TutorialDetailScreen() {
  const { t, language } = useTranslation();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tutorial, loading, error } = useTutorial(id);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { speak, stop, isSpeaking } = useSpeech();
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#333333';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#444444' : '#E0E0E0';
  
  useEffect(() => {
    // Stop speech when navigating away
    return () => {
      stop();
    };
  }, []);
  
  const handlePrevSlide = () => {
    stop();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleNextSlide = () => {
    stop();
    if (tutorial && currentSlideIndex < tutorial.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const toggleSpeech = () => {
    if (isSpeaking) {
      stop();
    } else if (tutorial) {
      const slideContent = language === 'en' 
        ? tutorial.slides[currentSlideIndex].content 
        : tutorial.slides[currentSlideIndex].content_kn;
      speak(slideContent);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <Stack.Screen 
          options={{ 
            headerTitle: t('loading'),
            headerShown: true,
            headerStyle: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
            headerTintColor: textColor,
          }} 
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>{t('loadingTutorial')}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !tutorial) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
        <Stack.Screen 
          options={{ 
            headerTitle: t('error'),
            headerShown: true,
            headerStyle: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
            headerTintColor: textColor,
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>{t('tutorialNotFound')}</Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: '#FF8F00' }]} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t('backToTutorials')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentSlide = tutorial.slides[currentSlideIndex];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <Stack.Screen 
        options={{ 
          headerTitle: language === 'en' ? tutorial.title : tutorial.title_kn,
          headerShown: true,
          headerStyle: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
          headerTintColor: textColor,
        }} 
      />
      
      <View style={styles.progressBar}>
        {tutorial.slides.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressDot, 
              { 
                backgroundColor: index <= currentSlideIndex ? '#FF8F00' : isDark ? '#444444' : '#E0E0E0',
              }
            ]} 
          />
        ))}
      </View>
      
      <View style={[styles.slideContainer, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.slideHeader}>
          <Text style={[styles.slideNumber, { color: isDark ? '#BBBBBB' : '#666666' }]}>
            {currentSlideIndex + 1}/{tutorial.slides.length}
          </Text>
          <TouchableOpacity style={styles.audioButton} onPress={toggleSpeech}>
            {isSpeaking ? (
              <VolumeX size={24} color="#FF8F00" />
            ) : (
              <Volume2 size={24} color={isDark ? '#BBBBBB' : '#666666'} />
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.slideContent} contentContainerStyle={styles.slideContentInner}>
          <Text style={[styles.slideTitle, { color: textColor }]}>
            {language === 'en' ? currentSlide.content : currentSlide.content_kn}
          </Text>
          {currentSlide.image_url && (
            <View style={styles.slideImageContainer}>
              <Image 
                source={{ uri: currentSlide.image_url }}
                style={styles.slideImage}
                resizeMode="contain"
              />
            </View>
          )}
        </ScrollView>
      </View>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.prevButton, 
            { 
              backgroundColor: currentSlideIndex > 0 ? '#FF8F00' : isDark ? '#333333' : '#E0E0E0',
              opacity: currentSlideIndex > 0 ? 1 : 0.5
            }
          ]} 
          onPress={handlePrevSlide}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
          <Text style={styles.navButtonText}>{t('previous')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.nextButton, 
            { 
              backgroundColor: currentSlideIndex < tutorial.slides.length - 1 ? '#FF8F00' : isDark ? '#333333' : '#E0E0E0',
              opacity: currentSlideIndex < tutorial.slides.length - 1 ? 1 : 0.5
            }
          ]} 
          onPress={handleNextSlide}
          disabled={currentSlideIndex >= tutorial.slides.length - 1}
        >
          <Text style={styles.navButtonText}>{t('next')}</Text>
          <ChevronRight size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  slideContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  slideNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  audioButton: {
    padding: 8,
  },
  slideContent: {
    flex: 1,
  },
  slideContentInner: {
    padding: 16,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 24,
  },
  slideImageContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  prevButton: {
    paddingLeft: 16,
  },
  nextButton: {
    paddingRight: 16,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});