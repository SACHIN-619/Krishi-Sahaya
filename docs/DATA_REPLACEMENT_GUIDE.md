# 📊 Data Replacement Guide

This guide explains how to replace demo data with real data sources in KrishiSahay.

---

## Current Architecture

```
Demo Data Flow:
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│ mockData.ts     │ ──► │ useDataSources.tsx│ ──► │ UI Components│
│ (generators)    │     │ (hooks)          │     │             │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

```
Real Data Flow (Target):
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│ Python Backend  │ ──► │ useDataSources.tsx│ ──► │ UI Components│
│ (FastAPI)       │     │ (API calls)      │     │             │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

---

## Step-by-Step Replacement

### 1. Weather Data

**Current location:** `src/hooks/useDataSources.tsx` - `useWeatherData()`

**Current (Demo):**
```typescript
setState({
  data: generateWeatherData(), // Mock generator
  loading: false,
  error: null,
  isDemo: true,
});
```

**Replace with (Real):**
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useWeatherData = () => {
  const [state, setState] = useState<DataState<WeatherData>>({...});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/weather`);
        if (!response.ok) throw new Error('API failed');
        
        const data = await response.json();
        setState({
          data: data,
          loading: false,
          error: null,
          isDemo: data.isDemo ?? false,
        });
      } catch (err) {
        // Fallback to demo mode
        console.warn('Weather API unavailable, using demo data');
        setState({
          data: generateWeatherData(),
          loading: false,
          error: null,
          isDemo: true,
        });
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, []);
  
  return state;
};
```

---

### 2. Market Prices

**File:** `src/hooks/useDataSources.tsx` - `useMarketPrices()`

**Replace with:**
```typescript
export const useMarketPrices = () => {
  const [state, setState] = useState<DataState<MarketPrice[]>>({...});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/market/prices`);
        if (!response.ok) throw new Error('API failed');
        
        const data = await response.json();
        setState({
          data: data.prices,
          loading: false,
          error: null,
          isDemo: data.isDemo ?? false,
        });
      } catch (err) {
        setState({
          data: generateMarketPrices(),
          loading: false,
          error: null,
          isDemo: true,
        });
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 min refresh
    return () => clearInterval(interval);
  }, []);
  
  return state;
};
```

---

### 3. Government Schemes

**Replace `useSchemes()` with:**
```typescript
export const useSchemes = () => {
  const [state, setState] = useState<DataState<GovernmentScheme[]>>({...});
  
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/schemes`);
        const data = await response.json();
        setState({
          data: data.schemes,
          loading: false,
          error: null,
          isDemo: data.isDemo ?? false,
        });
      } catch (err) {
        setState({
          data: generateSchemes(),
          loading: false,
          error: null,
          isDemo: true,
        });
      }
    };
    
    fetchSchemes();
  }, []);
  
  return state;
};
```

---

### 4. Advisory/RAG Integration

**Create new hook:** `src/hooks/useAdvisory.tsx`

```typescript
import { useState } from 'react';

interface AdvisoryResponse {
  offlineAnswer: string;
  expertAdvice?: string;
  source: 'faiss' | 'api' | 'hybrid';
  confidence: number;
  relatedTopics: string[];
}

export const useAdvisory = () => {
  const [loading, setLoading] = useState(false);
  
  const askQuestion = async (query: string, language: string): Promise<AdvisoryResponse> => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/advisory/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
      });
      
      const data = await response.json();
      return data;
    } catch (err) {
      // Return demo response
      return {
        offlineAnswer: 'Demo mode: Unable to connect to advisory service.',
        source: 'faiss',
        confidence: 0,
        relatedTopics: [],
      };
    } finally {
      setLoading(false);
    }
  };
  
  return { askQuestion, loading };
};
```

---

### 5. Disease Diagnosis

**Create hook:** `src/hooks/useDiagnosis.tsx`

```typescript
interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string;
  prevention: string;
}

export const useDiagnosis = () => {
  const [loading, setLoading] = useState(false);
  
  const analyzeImage = async (file: File): Promise<DiagnosisResult> => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE}/api/diagnosis/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (err) {
      // Demo fallback
      return {
        disease: 'Late Blight (Demo)',
        confidence: 85,
        severity: 'medium',
        treatment: 'Demo: Apply fungicide as per local extension officer advice.',
        prevention: 'Demo: Use resistant varieties and proper spacing.',
      };
    } finally {
      setLoading(false);
    }
  };
  
  return { analyzeImage, loading };
};
```

---

## Environment Setup

Create `.env` file in frontend root:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# For production
# VITE_API_URL=https://api.krishisahay.com
```

---

## Data Sources Overview

| Feature | Demo Source | Real Source |
|---------|-------------|-------------|
| Weather | `generateWeatherData()` | OpenWeatherMap / IMD API |
| Market Prices | `generateMarketPrices()` | CSV + Agmarknet API |
| Soil Data | `generateSoilData()` | IoT sensors / Manual entry |
| Schemes | `generateSchemes()` | `schemes_kb.json` |
| Advisory | Mock responses | FAISS + IBM Watsonx |
| Diagnosis | Mock results | Vision AI + `diseases_kb.json` |

---

## Offline-First Fallback Chain

```
1. Try real API
   ↓ (if fails)
2. Try cached data (localStorage)
   ↓ (if empty)
3. Use demo generators
   ↓
4. Tag response as isDemo: true
```

---

## Testing Your Integration

1. Start Python backend: `uvicorn app.main:app --reload`
2. Update `.env` with `VITE_API_URL=http://localhost:8000`
3. Restart frontend: `npm run dev`
4. Check browser DevTools Network tab for API calls
5. Verify `isDemo: false` in responses when connected

---

## Common Issues

### CORS Errors
Ensure FastAPI has CORS middleware configured (see backend prompt).

### API Timeout
Increase timeout in fetch or use retry logic.

### Missing Data Fields
Ensure backend response matches TypeScript types in `src/types/data.ts`.
