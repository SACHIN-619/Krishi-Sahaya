import { WeatherCard } from '@/components/cards/WeatherCard';
import { MarketPulseCard } from '@/components/cards/MarketPulseCard';
import { SoilCard } from '@/components/cards/SoilCard';
import { SystemHealthCard } from '@/components/cards/SystemHealthCard';
import { VerifiedAnswerPanel } from '@/components/panels/VerifiedAnswerPanel';
import { ExpertAdvicePanel } from '@/components/panels/ExpertAdvicePanel';
import { DiagnosisPortal } from '@/components/panels/DiagnosisPortal';
import { SubsidySentinel } from '@/components/panels/SubsidySentinel';

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
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome to <span className="neon-text">KrishiSahay</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Your intelligent farming companion. Real-time market insights, AI-powered diagnostics, and verified agricultural knowledge.
          </p>
        </div>
      </section>

      {/* Precision Grid - 4 Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WeatherCard />
        <MarketPulseCard />
        <SoilCard />
        <SystemHealthCard />
      </section>
      
      {/* Core Split View */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        <VerifiedAnswerPanel />
        <ExpertAdvicePanel />
      </section>
      
      {/* Visual Diagnostic Portal */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DiagnosisPortal />
        </div>
        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Recent Diagnoses</h3>
          <div className="space-y-3">
            {[
              { crop: 'Tomato', disease: 'Early Blight', time: '2 hours ago' },
              { crop: 'Rice', disease: 'Blast', time: '5 hours ago' },
              { crop: 'Cotton', disease: 'Healthy', time: '1 day ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.crop}</p>
                  <p className="text-xs text-muted-foreground">{item.disease}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Subsidy Sentinel Footer */}
      <section>
        <SubsidySentinel />
      </section>
      
      {/* Demo Mode Notice */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground font-mono">
          🌱 KrishiSahay v1.0 | Data sources: Demo Mode - Replace with live feeds
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
