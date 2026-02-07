// KrishiSahay Data Types - All data flows from CSV/JSON/API sources

export type Language = 'en' | 'hi' | 'te' | 'ta';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainProbability: number;
  condition: string;
  location: string;
  lastUpdated: string;
}

export interface MarketPrice {
  commodity: string;
  currentPrice: number;
  avgPrice: number;
  deltaPercent: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  market: string;
  lastUpdated: string;
}

export interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  lastUpdated: string;
}

export interface SystemHealth {
  databaseReady: boolean;
  vectorStoreReady: boolean;
  apiStatus: 'online' | 'offline' | 'degraded';
  lastSync: string;
  recordCount: number;
}

export interface Alert {
  id: string;
  type: 'price' | 'weather' | 'scheme' | 'pest';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefit: string;
  deadline?: string;
  applyUrl: string;
  category: string;
}

export interface CropDisease {
  id: string;
  name: string;
  symptoms: string[];
  treatment: string;
  prevention: string;
  affectedCrops: string[];
  severity: 'low' | 'medium' | 'high';
  imageUrl?: string;
}

export interface QueryResponse {
  offlineAnswer: string;
  expertAdvice?: string;
  source: 'faiss' | 'api' | 'hybrid';
  confidence: number;
  relatedTopics: string[];
}

export interface MarqueeItem {
  commodity: string;
  price: number;
  change: number;
  market: string;
}

// Translations
export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
    ta: string;
  };
}
