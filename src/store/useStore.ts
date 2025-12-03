import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

interface AppState {
  // Device & Auth
  deviceId: string | null;
  userId: string | null;
  token: string | null;
  
  // Onboarding progress
  onboardingStep: number;
  onboardingComplete: boolean;
  
  // Profile data
  name: string;
  gender: string;
  preferredGender: string;
  
  // Style selection
  style: 'real' | 'anime' | null;
  
  // Character & Scenario
  characters: Character[];
  selectedCharacter: Character | null;
  scenarios: Scenario[];
  selectedScenario: Scenario | null;
  
  // Chat
  messages: Message[];
  isTyping: boolean;
  
  // Theme
  isDarkMode: boolean;
  
  // Actions
  setDeviceId: (id: string) => void;
  setAuth: (userId: string, token: string) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  setProfile: (name: string, gender: string, preferredGender: string) => void;
  setStyle: (style: 'real' | 'anime') => void;
  setCharacters: (characters: Character[]) => void;
  selectCharacter: (character: Character) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  selectScenario: (scenario: Scenario) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
  toggleDarkMode: () => void;
  reset: () => void;
}

const generateDeviceId = () => {
  return 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const initialState = {
  deviceId: null,
  userId: null,
  token: null,
  onboardingStep: 0,
  onboardingComplete: false,
  name: '',
  gender: '',
  preferredGender: '',
  style: null as 'real' | 'anime' | null,
  characters: [] as Character[],
  selectedCharacter: null,
  scenarios: [] as Scenario[],
  selectedScenario: null,
  messages: [] as Message[],
  isTyping: false,
  isDarkMode: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setDeviceId: (id) => set({ deviceId: id }),
      
      setAuth: (userId, token) => set({ userId, token }),
      
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      setProfile: (name, gender, preferredGender) => set({ name, gender, preferredGender }),
      
      setStyle: (style) => set({ style }),
      
      setCharacters: (characters) => set({ characters }),
      
      selectCharacter: (character) => set({ selectedCharacter: character }),
      
      setScenarios: (scenarios) => set({ scenarios }),
      
      selectScenario: (scenario) => set({ selectedScenario: scenario }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: Math.random().toString(36).substring(2),
          timestamp: new Date(),
        }],
      })),
      
      setTyping: (isTyping) => set({ isTyping }),
      
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newMode };
      }),
      
      reset: () => set({ ...initialState, deviceId: get().deviceId }),
    }),
    {
      name: 'ikasa-storage',
      partialize: (state) => ({
        deviceId: state.deviceId,
        userId: state.userId,
        token: state.token,
        onboardingStep: state.onboardingStep,
        onboardingComplete: state.onboardingComplete,
        name: state.name,
        gender: state.gender,
        preferredGender: state.preferredGender,
        style: state.style,
        selectedCharacter: state.selectedCharacter,
        selectedScenario: state.selectedScenario,
        messages: state.messages,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);

// Initialize device ID if not exists
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('ikasa-storage');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed.state?.deviceId) {
      useStore.getState().setDeviceId(generateDeviceId());
    }
    // Apply dark mode on load
    if (parsed.state?.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  } else {
    useStore.getState().setDeviceId(generateDeviceId());
  }
}
