import { Cloud, Droplets, Thermometer, Sun, Wind, MapPin } from 'lucide-react';
import { useWeatherData } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';

export const WeatherCard = () => {
  const { data, loading, isDemo } = useWeatherData();
  const { t } = useLanguage();

  if (loading) return <SkeletonCard className="min-h-[140px]" />;
  if (!data) return <div className="glass-card p-4 min-h-[140px] flex items-center justify-center"><p className="text-muted-foreground text-sm">{t('noData')}</p></div>;

  const WeatherIcon = data.condition?.toLowerCase().includes('rain') ? Droplets :
                      data.condition?.toLowerCase().includes('cloud') ? Cloud : Sun;

  return (
    <div className="glass-card-hover p-4 min-h-[140px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <WeatherIcon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('weather')}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDemo ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 'bg-primary/20 text-primary'}`}>
          {isDemo ? 'DEMO' : 'LIVE'}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold font-mono neon-text">{data.temperature}</span>
        <span className="text-lg text-muted-foreground">°C</span>
        <span className="ml-auto text-xs text-muted-foreground">{data.condition}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-foreground">{data.humidity}%</span>
          <span className="text-muted-foreground">humidity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono text-foreground">{data.windSpeed}</span>
          <span className="text-muted-foreground">km/h</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <MapPin className="w-3 h-3 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground truncate">{data.location}</p>
        <span className="text-[10px] text-primary ml-auto">{data.rainProbability}% rain</span>
      </div>
    </div>
  );
};
