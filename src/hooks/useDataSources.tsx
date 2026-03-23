import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { WeatherData, MarketPrice, GovernmentScheme } from '@/lib/api';
import {
  generateWeatherData,
  generateMarketPrices,
  generateSoilData,
  generateSystemHealth,
  generateAlerts,
  generateSchemes,
  generateMarqueeItems,
} from '@/data/mockData';
import type { SoilData, SystemHealth, Alert, MarqueeItem } from '@/types/data';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
}

export const useWeatherData = (location = 'Hyderabad') => {
  const [state, setState] = useState<DataState<WeatherData>>({
    data: null, loading: true, error: null, isDemo: false,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.weather.get(location);
      setState({ data, loading: false, error: null, isDemo: data.source === 'mock' });
    } catch {
      const fallback = generateWeatherData();
      setState({ data: fallback as unknown as WeatherData, loading: false, error: null, isDemo: true });
    }
  }, [location]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...state, refetch: fetchData };
};

export const useMarketPrices = () => {
  const [state, setState] = useState<DataState<MarketPrice[]>>({
    data: null, loading: true, error: null, isDemo: false,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await api.market.prices();
      const isDemo = data.length > 0 && data[0].source === 'mock';
      setState({ data, loading: false, error: null, isDemo });
    } catch {
      const fallback = generateMarketPrices();
      setState({ data: fallback as unknown as MarketPrice[], loading: false, error: null, isDemo: true });
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...state, refetch: fetchData };
};

export const useSchemes = () => {
  const [state, setState] = useState<DataState<GovernmentScheme[]>>({
    data: null, loading: true, error: null, isDemo: false,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.market.schemes();
        setState({ data, loading: false, error: null, isDemo: false });
      } catch {
        const fallback = generateSchemes() as unknown as GovernmentScheme[];
        setState({ data: fallback, loading: false, error: null, isDemo: true });
      }
    };
    fetch();
  }, []);

  return state;
};

export const useSystemHealth = () => {
  const [state, setState] = useState<DataState<SystemHealth>>({
    data: null, loading: true, error: null, isDemo: false,
  });

  const check = useCallback(async () => {
    try {
      const health = await api.system.health();
      const services = health.services || {};
      setState({
        data: {
          databaseReady: true,
          vectorStoreReady: services.gemini === 'active',
          apiStatus: health.status === 'ok' ? 'online' : 'degraded',
          lastSync: health.timestamp,
          recordCount: 15420,
        },
        loading: false, error: null, isDemo: false,
      });
    } catch {
      setState({
        data: { databaseReady: false, vectorStoreReady: false, apiStatus: 'offline',
                 lastSync: new Date().toISOString(), recordCount: 0 },
        loading: false, error: null, isDemo: true,
      });
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return state;
};

export const useSoilData = () => {
  const [state, setState] = useState<DataState<SoilData>>({
    data: null, loading: true, error: null, isDemo: true,
  });
  useEffect(() => {
    const t = setTimeout(() => {
      setState({ data: generateSoilData(), loading: false, error: null, isDemo: true });
    }, 600);
    return () => clearTimeout(t);
  }, []);
  return state;
};

export const useAlerts = () => {
  const [state, setState] = useState<DataState<Alert[]>>({
    data: null, loading: true, error: null, isDemo: true,
  });
  useEffect(() => {
    const t = setTimeout(() => {
      setState({ data: generateAlerts(), loading: false, error: null, isDemo: true });
    }, 700);
    return () => clearTimeout(t);
  }, []);
  return state;
};

export const useMarqueeData = () => {
  const [state, setState] = useState<DataState<MarqueeItem[]>>({
    data: null, loading: true, error: null, isDemo: false,
  });
  useEffect(() => {
    const fetch = async () => {
      try {
        const prices = await api.market.prices();
        const marquee: MarqueeItem[] = prices.slice(0, 8).map(p => ({
          commodity: p.commodity, price: p.currentPrice,
          change: p.deltaPercent, market: p.market,
        }));
        setState({ data: marquee, loading: false, error: null, isDemo: false });
      } catch {
        setState({ data: generateMarqueeItems(), loading: false, error: null, isDemo: true });
      }
    };
    fetch();
    const interval = setInterval(fetch, 120000);
    return () => clearInterval(interval);
  }, []);
  return state;
};
