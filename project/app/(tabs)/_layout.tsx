import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Clover as Government, Chrome as Home, CloudRain, BookOpen, Microscope } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#388E3C',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#E0E0E0' : '#757575',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
        },
        headerStyle: {
          backgroundColor: '#388E3C',
        },
        headerTintColor: '#FFFFFF',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="disease-detection"
        options={{
          title: t('diseaseDetection'),
          tabBarIcon: ({ color, size }) => <Microscope size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schemes"
        options={{
          title: t('schemes'),
          tabBarIcon: ({ color, size }) => <Government size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: t('weather'),
          tabBarIcon: ({ color, size }) => <CloudRain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tutorials"
        options={{
          title: t('tutorials'),
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}