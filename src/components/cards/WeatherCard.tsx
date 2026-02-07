import { Cloud, Droplets, Thermometer, Sun } from 'lucide-react';
import { useWeatherData } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

export const WeatherCard = () => {
  const { data, loading, error, isDemo } = useWeatherData();
  const { t } = useLanguage();
  
  if (loading) return <SkeletonCard className="min-h-[140px]" />;
  
  if (error || !data) {
    return (
      <div className="glass-card p-4 min-h-[140px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('noData')}</p>
      </div>
    );
  }
  
  const WeatherIcon = data.condition.includes('Rain') ? Droplets : 
                      data.condition.includes('Cloud') ? Cloud : Sun;
  
  return (
    <div className="glass-card-hover p-4 min-h-[140px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('weather')}</span>
        </div>
        {isDemo && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-alert/20 text-alert font-mono">
            DEMO
          </span>
        )}
      </div>
      
      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold font-mono neon-text">{data.temperature}</span>
        <span className="text-lg text-muted-foreground">°C</span>
        <WeatherIcon className="w-5 h-5 text-primary ml-auto" />
      </div>
      
      {/* Sub Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t('temperature')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono">{data.rainProbability}%</span>
          <span className="text-muted-foreground text-[10px]">{t('rainProbability')}</span>
        </div>
      </div>
      
      {/* Location */}
      <p className="text-[10px] text-muted-foreground mt-2 truncate">{data.location}</p>
    </div>
  );
};
