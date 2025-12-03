const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://142.93.214.98:5001';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Auth
export interface AuthResponse {
  userId: string;
  token: string;
}

export async function anonymousLogin(deviceId: string): Promise<ApiResponse<AuthResponse>> {
  return apiCall<AuthResponse>('/app-api/auth/anonymous', {
    method: 'POST',
    body: JSON.stringify({ deviceId }),
  });
}

// Profile
export interface ProfileData {
  name: string;
  gender: string;
  preferredGender: string;
}

export async function saveProfile(data: ProfileData): Promise<ApiResponse> {
  return apiCall('/app-api/onboard/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Style
export interface StyleData {
  style: 'real' | 'anime';
}

export async function saveStyle(data: StyleData): Promise<ApiResponse> {
  return apiCall('/app-api/onboard/style', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Characters
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}

export interface SessionResponse {
  characters: Character[];
  scenarios?: Scenario[];
}

export async function getSession(userId: string): Promise<ApiResponse<SessionResponse>> {
  return apiCall<SessionResponse>(`/app-api/session?userId=${encodeURIComponent(userId)}`);
}

export async function selectCharacter(characterId: string): Promise<ApiResponse> {
  return apiCall('/app-api/select-character', {
    method: 'POST',
    body: JSON.stringify({ characterId }),
  });
}

// Scenarios
export interface Scenario {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
}

export async function selectScenario(scenarioId: string): Promise<ApiResponse> {
  return apiCall('/app-api/select-scenario', {
    method: 'POST',
    body: JSON.stringify({ scenarioId }),
  });
}

// Chat
export interface ChatRequest {
  userId: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  characterName?: string;
}

export async function sendMessage(data: ChatRequest): Promise<ApiResponse<ChatResponse>> {
  return apiCall<ChatResponse>('/app-api/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
