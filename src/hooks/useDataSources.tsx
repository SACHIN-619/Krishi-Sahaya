import { useState, useEffect, useCallback } from 'react';
import { 
  WeatherData, 
  MarketPrice, 
  SoilData, 
  SystemHealth, 
  Alert,
  GovernmentScheme,
  MarqueeItem
} from '@/types/data';
import {
  generateWeatherData,
  generateMarketPrices,
  generateSoilData,
  generateSystemHealth,
  generateAlerts,
  generateSchemes,
  generateMarqueeItems,
} from '@/data/mockData';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

// Weather data hook
export const useWeatherData = () => {
  const [state, setState] = useState<DataState<WeatherData>>({
    data: null,
    loading: true,
    error: null,
    isDemo: true,
  });
  
  useEffect(() => {
    // TODO: Replace with actual Weather API call
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));
        setState({
          data: generateWeatherData(),
          loading: false,
          error: null,
          isDemo: true, // Set to false when using real API
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch weather' }));
      }
    };
    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);
  
  return state;
};

// Market prices hook
export const useMarketPrices = () => {
  const [state, setState] = useState<DataState<MarketPrice[]>>({
    data: null,
    loading: true,
    error: null,
    isDemo: true,
  });
  
  useEffect(() => {
    // TODO: Replace with Agmarknet API or CSV loader
    const fetchData = async () => {
      try {
        await new Promise(r => setTimeout(r, 1000));
        setState({
          data: generateMarketPrices(),
          loading: false,
          error: null,
          isDemo: true,
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch prices' }));
      }
    };
    fetchData();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);
  
  return state;
};

// Soil data hook
export const useSoilData = () => {
  const [state, setState] = useState<DataState<SoilData>>({
    data: null,
    loading: true,
    error: null,
    isDemo: true,
  });
  
  useEffect(() => {
    // TODO: Replace with IoT sensor data source
    const fetchData = async () => {
      try {
        await new Promise(r => setTimeout(r, 600));
        setState({
          data: generateSoilData(),
          loading: false,
          error: null,
          isDemo: true,
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch soil data' }));
      }
    };
    fetchData();
  }, []);
  
  return state;
};

// System health hook
export const useSystemHealth = () => {
  const [state, setState] = useState<DataState<SystemHealth>>({
    data: null,
    loading: true,
    error: null,
    isDemo: false,
  });
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await new Promise(r => setTimeout(r, 500));
        setState({
          data: generateSystemHealth(),
          loading: false,
          error: null,
          isDemo: false,
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'System check failed' }));
      }
    };
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return state;
};

// Alerts hook
export const useAlerts = () => {
  const [state, setState] = useState<DataState<Alert[]>>({
    data: null,
    loading: true,
    error: null,
    isDemo: true,
  });
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        await new Promise(r => setTimeout(r, 700));
        setState({
          data: generateAlerts(),
          loading: false,
          error: null,
          isDemo: true,
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch alerts' }));
      }
    };
    fetchAlerts();
  }, []);
  
  return state;
};

// Government schemes hook
export const useSchemes = () => {
  const [state, setState] = useState<DataState<GovernmentScheme[]>>({
    data: null,
    loading: true,
    error: null,
    isDemo: true,
  });
  
  useEffect(() => {
    // TODO: Replace with schemes_kb.json loader
    const fetchSchemes = async () => {
      try {
        await new Promise(r => setTimeout(r, 900));
        setState({
          data: generateSchemes(),
          loading: false,
          error: null,
          isDemo: true,
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch schemes' }));
      }
    };
    fetchSchemes();
  }, []);
  
  return state;
};

// Marquee data hook
export const useMarqueeData = () => {
  const [state, setState] = useState<DataState<MarqueeItem[]>>({
    data: null,
    loading: true,
    error: null,
    isDemo: true,
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(r => setTimeout(r, 500));
        setState({
          data: generateMarqueeItems(),
          loading: false,
          error: null,
          isDemo: true,
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch marquee data' }));
      }
    };
    fetchData();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);
  
  return state;
};
