import { WeatherCard } from '@/components/cards/WeatherCard';
import { MarketPulseCard } from '@/components/cards/MarketPulseCard';
import { SoilCard } from '@/components/cards/SoilCard';
import { SystemHealthCard } from '@/components/cards/SystemHealthCard';
import { VerifiedAnswerPanel } from '@/components/panels/VerifiedAnswerPanel';
import { ExpertAdvicePanel } from '@/components/panels/ExpertAdvicePanel';
import { DiagnosisPortal } from '@/components/panels/DiagnosisPortal';
import { SubsidySentinel } from '@/components/panels/SubsidySentinel';
import { Leaf, TrendingUp, Zap } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden h-48 md:h-64">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=400&fit=crop"
          alt="Agricultural landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center p-8">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">AI Agriculture Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome to <span className="neon-text">KrishiSahay</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm">
            Real-time market intelligence • AI disease detection • Government scheme discovery
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Live market data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Gemini AI powered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">3+ API integrations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WeatherCard />
        <MarketPulseCard />
        <SoilCard />
        <SystemHealthCard />
      </section>

      {/* AI Advisory Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <VerifiedAnswerPanel />
        <ExpertAdvicePanel />
      </section>

      {/* Diagnosis + Recent */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DiagnosisPortal />
        </div>
        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { crop: 'Tomato', disease: 'Early Blight', time: '2h ago', severity: 'medium' },
              { crop: 'Rice', disease: 'Blast detected', time: '5h ago', severity: 'high' },
              { crop: 'Cotton', disease: 'Healthy', time: '1d ago', severity: 'none' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.crop}</p>
                  <p className="text-xs text-muted-foreground">{item.disease}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    item.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                    item.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {item.severity === 'none' ? 'healthy' : item.severity}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Upload crop photos for AI diagnosis →
            </p>
          </div>
        </div>
      </section>

      {/* Subsidy Sentinel */}
      <section>
        <SubsidySentinel />
      </section>
    </div>
  );
};

export default DashboardPage;
