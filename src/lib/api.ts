// KrishiSahay API Service - Connects to FastAPI backend
// Backend URL from env variable (VITE_API_URL) or defaults to localhost

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainProbability: number;
  condition: string;
  location: string;
  windSpeed: number;
  feelsLike: number;
  description: string;
  lastUpdated: string;
  source: string;
}

export interface MarketPrice {
  commodity: string;
  currentPrice: number;
  avgPrice: number;
  deltaPercent: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  market: string;
  state: string;
  variety: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  lastUpdated: string;
  source: string;
}

export interface DiseaseResult {
  disease: string;
  confidence: number;
  severity: 'none' | 'low' | 'medium' | 'high';
  treatment: string;
  prevention: string;
  recommendation: string;
  source: string;
  image_analyzed: boolean;
  timestamp: string;
}

export interface AIAdviceResult {
  response: string;
  source: string;
  model?: string;
  timestamp: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefit: string;
  website: string;
  category: string;
  deadline?: string;
  applyUrl: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  timestamp: string;
  services: Record<string, string>;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  weather: {
    get: (location = 'Hyderabad') =>
      apiRequest<WeatherData>(`/api/weather?location=${encodeURIComponent(location)}`),
  },

  market: {
    prices: () => apiRequest<MarketPrice[]>('/api/market/prices'),
    schemes: () => apiRequest<GovernmentScheme[]>('/api/market/schemes'),
  },

  disease: {
    detect: async (file: File): Promise<DiseaseResult> => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/api/disease/detect`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('Disease detection failed');
      return res.json();
    },
  },

  ai: {
    advice: (question: string, language = 'en', crop?: string, location?: string) =>
      apiRequest<AIAdviceResult>('/api/ai/advice', {
        method: 'POST',
        body: JSON.stringify({ question, language, crop, location }),
      }),
  },

  system: {
    health: () => apiRequest<SystemHealth>('/health'),
    offlineData: () => apiRequest<unknown>('/api/offline/data'),
  },
};

export default api;
