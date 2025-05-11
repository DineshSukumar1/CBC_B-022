import { Crop } from '@/types';

export const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Rice',
    kannadaName: 'ಅಕ್ಕಿ',
    description: 'Rice is a staple food crop in India.',
    kannadaDescription: 'ಅಕ್ಕಿ ಭಾರತದಲ್ಲಿ ಪ್ರಮುಖ ಆಹಾರ ಬೆಳೆ.',
    soilAndFertilizer: 'Requires clayey soil with good water retention.',
    kannadaSoilAndFertilizer: 'ಒಳ್ಳೆಯ ನೀರು ಹಿಡಿದಿಡುವ ಸಾಮರ್ಥ್ಯವಿರುವ ಜೇಡಿ ಮಣ್ಣು ಬೇಕಾಗುತ್ತದೆ.',
    cultivationTips: 'Plant in well-prepared fields with proper water management.',
    kannadaCultivationTips: 'ಸರಿಯಾದ ನೀರು ನಿರ್ವಹಣೆಯೊಂದಿಗೆ ಚೆನ್ನಾಗಿ ಸಿದ್ಧಪಡಿಸಿದ ಹೊಲಗಳಲ್ಲಿ ನೆಡಿ.',
    season: ['kharif'],
    waterRequirement: 'High',
    temperature: '20-35°C'
  },
  {
    id: '2',
    name: 'Wheat',
    kannadaName: 'ಗೋಧಿ',
    description: 'Wheat is a major cereal crop.',
    kannadaDescription: 'ಗೋಧಿ ಪ್ರಮುಖ ಧಾನ್ಯ ಬೆಳೆ.',
    soilAndFertilizer: 'Well-drained loamy soil is ideal.',
    kannadaSoilAndFertilizer: 'ಚೆನ್ನಾಗಿ ನೀರು ಬಸಿದು ಹೋಗುವ ಮರಳುಮಿಶ್ರಿತ ಮಣ್ಣು ಸೂಕ್ತ.',
    cultivationTips: 'Sow in rows with proper spacing.',
    kannadaCultivationTips: 'ಸರಿಯಾದ ಅಂತರದೊಂದಿಗೆ ಸಾಲುಗಳಲ್ಲಿ ಬಿತ್ತಿ.',
    season: ['rabi'],
    waterRequirement: 'Medium',
    temperature: '15-25°C'
  }
];

// Export async functions that will be used throughout the app
export const fetchCrops = async (): Promise<Crop[]> => {
  return mockCrops;
};

export const fetchCropById = async (id: string): Promise<Crop | undefined> => {
  return mockCrops.find(crop => crop.id === id);
};