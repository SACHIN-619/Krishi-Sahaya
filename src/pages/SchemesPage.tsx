import { FileText, Clock, ExternalLink } from 'lucide-react';
import { useSchemes } from '@/hooks/useDataSources';
import { useLanguage } from '@/hooks/useLanguage';
import { SkeletonCard } from '@/components/ui/skeleton-loader';
import { cn } from '@/lib/utils';

const SchemesPage = () => {
  const { data: schemes, loading, error, isDemo } = useSchemes();
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-alert/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-alert" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('schemes')}</h1>
            <p className="text-muted-foreground text-sm">Government schemes and subsidies for farmers</p>
          </div>
        </div>
        {isDemo && (
          <span className="text-xs px-3 py-1 rounded-full bg-alert/20 text-alert font-mono">
            DEMO DATA
          </span>
        )}
      </div>
      
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden h-48">
        <img 
          src="https://images.unsplash.com/photo-1589923188651-268a9765e432?w=1200&h=300&fit=crop"
          alt="Government schemes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            ⚡ {t('subsidySentinel')}
          </h2>
          <p className="text-muted-foreground max-w-md">
            Never miss a deadline. Get notified about high-impact schemes and subsidies.
          </p>
        </div>
      </div>
      
      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-64" />)}
        </div>
      ) : error || !schemes ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          {t('noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme, index) => (
            <div 
              key={scheme.id}
              className="glass-card-hover p-6 flex flex-col animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Category Badge */}
              <span className="inline-block self-start text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-mono mb-4">
                {scheme.category}
              </span>
              
              {/* Scheme Name */}
              <h3 className="text-lg font-bold text-foreground mb-2">{scheme.name}</h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {scheme.description}
              </p>
              
              {/* Benefit */}
              <div className="mb-4 p-3 rounded-lg bg-accent/50">
                <p className="text-xs text-muted-foreground">Benefit:</p>
                <p className="font-semibold neon-text">{scheme.benefit}</p>
              </div>
              
              {/* Eligibility */}
              <p className="text-xs text-muted-foreground mb-4">
                <span className="font-semibold">Eligibility:</span> {scheme.eligibility}
              </p>
              
              {/* Deadline if exists */}
              {scheme.deadline && (
                <div className="flex items-center gap-2 text-sm text-alert mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>
                </div>
              )}
              
              {/* Apply Button */}
              <a
                href={scheme.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center justify-center gap-2 w-full py-3 rounded-lg',
                  'cta-glow text-primary-foreground font-medium',
                  'hover:shadow-neon-lg transition-all'
                )}
              >
                <ExternalLink className="w-4 h-4" />
                {t('applyNow')}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
