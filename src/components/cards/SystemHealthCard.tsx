import { Activity, Database, Server } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

export const SystemHealthCard = () => {
  const { data, loading, error } = useSystemHealth();
  const { t } = useLanguage();
  
  if (loading) return <SkeletonCard className="min-h-[140px]" />;
  
  if (error || !data) {
    return (
      <div className="glass-card p-4 min-h-[140px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('noData')}</p>
      </div>
    );
  }
  
  const isHealthy = data.databaseReady && data.vectorStoreReady && data.apiStatus === 'online';
  
  return (
    <div className="glass-card-hover p-4 min-h-[140px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('systemHealth')}</span>
        </div>
        <span className="pulse-dot" />
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn(
          'text-lg font-bold',
          isHealthy ? 'neon-text' : 'text-alert'
        )}>
          {isHealthy ? 'OPERATIONAL' : 'DEGRADED'}
        </span>
      </div>
      
      {/* Sub Systems */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <Database className={cn(
            'w-3.5 h-3.5',
            data.databaseReady ? 'text-primary' : 'text-destructive'
          )} />
          <span className="text-muted-foreground">{t('offlineDatabaseReady')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Server className={cn(
            'w-3.5 h-3.5',
            data.vectorStoreReady ? 'text-primary' : 'text-destructive'
          )} />
          <span className="font-mono text-primary">{data.recordCount.toLocaleString()}</span>
          <span className="text-muted-foreground">records</span>
        </div>
      </div>
    </div>
  );
};
