import { Tutorial } from '@/types';
import { getTutorials, getTutorialById, getTutorialsByCategory } from '../services/tutorialService';

// Export async functions that will be used throughout the app
export const fetchTutorials = async (): Promise<Tutorial[]> => {
  return await getTutorials();
};

export const fetchTutorialById = async (id: string): Promise<Tutorial | undefined> => {
  return await getTutorialById(id);
};

export const fetchTutorialsByCategory = async (category: string): Promise<Tutorial[]> => {
  return await getTutorialsByCategory(category);
};

export const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: 'How to Use UPI',
    kannadaTitle: 'ಯುಪಿಐ ಬಳಸುವ ವಿಧಾನ',
    category: 'upi',
    slides: [
      {
        title: 'What is UPI?',
        kannadaTitle: 'ಯುಪಿಐ ಎಂದರೇನು?',
        content: 'UPI (Unified Payments Interface) is a real-time payment system developed by NPCI.',
        kannadaContent: 'ಯುಪಿಐ (ಯುನಿಫೈಡ್ ಪೇಮೆಂಟ್ಸ್ ಇಂಟರ್ಫೇಸ್) ಎಂಬುದು ಎನ್ಪಿಸಿಐಯಿಂದ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾದ ರಿಯಲ್-ಟೈಮ್ ಪಾವತಿ ವ್ಯವಸ್ಥೆ.',
        imageUrl: 'https://example.com/upi-intro.jpg'
      },
      {
        title: 'Setting Up UPI',
        kannadaTitle: 'ಯುಪಿಐ ಸೆಟಪ್ ಮಾಡುವ ವಿಧಾನ',
        content: 'Download a UPI app, link your bank account, and create a UPI ID.',
        kannadaContent: 'ಯುಪಿಐ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ, ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಯನ್ನು ಲಿಂಕ್ ಮಾಡಿ, ಮತ್ತು ಯುಪಿಐ ಐಡಿ ರಚಿಸಿ.',
        imageUrl: 'https://example.com/upi-setup.jpg'
      }
    ]
  },
  {
    id: '2',
    title: 'Internet Safety',
    kannadaTitle: 'ಇಂಟರ್ನೆಟ್ ಸುರಕ್ಷತೆ',
    category: 'security',
    slides: [
      {
        title: 'Password Security',
        kannadaTitle: 'ಪಾಸ್‌ವರ್ಡ್ ಸುರಕ್ಷತೆ',
        content: 'Use strong, unique passwords for each account.',
        kannadaContent: 'ಪ್ರತಿ ಖಾತೆಗೆ ಬಲವಾದ, ವಿಶಿಷ್ಟ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ಬಳಸಿ.',
        imageUrl: 'https://example.com/password-security.jpg'
      },
      {
        title: 'Safe Browsing',
        kannadaTitle: 'ಸುರಕ್ಷಿತ ಬ್ರೌಸಿಂಗ್',
        content: 'Always check website security and avoid suspicious links.',
        kannadaContent: 'ಯಾವಾಗಲೂ ವೆಬ್‌ಸೈಟ್ ಸುರಕ್ಷತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಂಶಯಾಸ್ಪದ ಲಿಂಕ್‌ಗಳನ್ನು ತಪ್ಪಿಸಿ.',
        imageUrl: 'https://example.com/safe-browsing.jpg'
      }
    ]
  }
];