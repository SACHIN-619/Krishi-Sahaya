// Mock Data Generator - Used when real data sources are unavailable
// This ensures UI remains functional in demo mode

import { 
  WeatherData, 
  MarketPrice, 
  SoilData, 
  SystemHealth, 
  Alert, 
  GovernmentScheme,
  MarqueeItem 
} from '@/types/data';

// Simulates real-time weather data
export const generateWeatherData = (): WeatherData => ({
  temperature: Math.floor(Math.random() * 15) + 25, // 25-40°C
  humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
  rainProbability: Math.floor(Math.random() * 100),
  condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
  location: 'Hyderabad, Telangana',
  lastUpdated: new Date().toISOString(),
});

// Simulates mandi price data (would come from CSV/Agmarknet API)
export const generateMarketPrices = (): MarketPrice[] => {
  const commodities = [
    { name: 'Wheat', basePrice: 2400, market: 'Azadpur Mandi' },
    { name: 'Rice', basePrice: 3200, market: 'Guntur Market' },
    { name: 'Cotton', basePrice: 6800, market: 'Adilabad APMC' },
    { name: 'Soybean', basePrice: 4500, market: 'Indore Mandi' },
    { name: 'Groundnut', basePrice: 5200, market: 'Rajkot Market' },
    { name: 'Maize', basePrice: 1900, market: 'Nizamabad APMC' },
  ];
  
  return commodities.map(c => {
    const variation = (Math.random() - 0.5) * 0.3; // ±15%
    const currentPrice = Math.round(c.basePrice * (1 + variation));
    const avgPrice = c.basePrice;
    const deltaPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
    
    return {
      commodity: c.name,
      currentPrice,
      avgPrice,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
      signal: deltaPercent > 15 ? 'SELL' : deltaPercent < -10 ? 'BUY' : 'HOLD',
      market: c.market,
      lastUpdated: new Date().toISOString(),
    };
  });
};

// Simulates soil sensor data
export const generateSoilData = (): SoilData => ({
  nitrogen: Math.floor(Math.random() * 50) + 30, // 30-80 kg/ha
  phosphorus: Math.floor(Math.random() * 30) + 15, // 15-45 kg/ha
  potassium: Math.floor(Math.random() * 60) + 100, // 100-160 kg/ha
  ph: Math.round((Math.random() * 2 + 5.5) * 10) / 10, // 5.5-7.5
  moisture: Math.floor(Math.random() * 30) + 40, // 40-70%
  lastUpdated: new Date().toISOString(),
});

// System health status
export const generateSystemHealth = (): SystemHealth => ({
  databaseReady: true,
  vectorStoreReady: true,
  apiStatus: Math.random() > 0.1 ? 'online' : 'degraded',
  lastSync: new Date().toISOString(),
  recordCount: Math.floor(Math.random() * 5000) + 10000,
});

// Active alerts
export const generateAlerts = (): Alert[] => [
  {
    id: 'alert-1',
    type: 'price',
    severity: 'warning',
    title: 'Cotton Price Surge',
    message: 'Cotton prices up 18% above 3-year average. Consider selling.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'alert-2',
    type: 'weather',
    severity: 'info',
    title: 'Rain Expected',
    message: 'Light rainfall expected in next 48 hours. Plan irrigation accordingly.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'alert-3',
    type: 'scheme',
    severity: 'critical',
    title: 'PM-KISAN Deadline',
    message: 'Last date for PM-KISAN registration is approaching.',
    timestamp: new Date().toISOString(),
    actionUrl: 'https://pmkisan.gov.in',
  },
];

// Government schemes
export const generateSchemes = (): GovernmentScheme[] => [
  {
    id: 'scheme-1',
    name: 'PM-KISAN',
    description: 'Direct income support of ₹6,000 per year to farmer families',
    eligibility: 'All landholding farmer families',
    benefit: '₹6,000/year in 3 installments',
    deadline: '2024-03-31',
    applyUrl: 'https://pmkisan.gov.in',
    category: 'Income Support',
  },
  {
    id: 'scheme-2',
    name: 'PMFBY',
    description: 'Crop insurance scheme against natural calamities',
    eligibility: 'All farmers growing notified crops',
    benefit: 'Insurance coverage up to sum insured',
    applyUrl: 'https://pmfby.gov.in',
    category: 'Insurance',
  },
  {
    id: 'scheme-3',
    name: 'Kisan Credit Card',
    description: 'Easy credit access for farming needs',
    eligibility: 'All farmers, sharecroppers, tenant farmers',
    benefit: 'Credit limit up to ₹3 lakh at 4% interest',
    applyUrl: 'https://www.nabard.org/content1.aspx?id=591',
    category: 'Credit',
  },
];

// Marquee items for live ticker
export const generateMarqueeItems = (): MarqueeItem[] => {
  const items = generateMarketPrices();
  return items.map(p => ({
    commodity: p.commodity,
    price: p.currentPrice,
    change: p.deltaPercent,
    market: p.market,
  }));
};
