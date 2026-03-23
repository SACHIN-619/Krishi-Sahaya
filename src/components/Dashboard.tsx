import { Sidebar } from './layout/Sidebar';
import { WeatherCard } from './cards/WeatherCard';
import { MarketPulseCard } from './cards/MarketPulseCard';
import { SoilCard } from './cards/SoilCard';
import { SystemHealthCard } from './cards/SystemHealthCard';
import { VerifiedAnswerPanel } from './panels/VerifiedAnswerPanel';
import { ExpertAdvicePanel } from './panels/ExpertAdvicePanel';
import { DiagnosisPortal } from './panels/DiagnosisPortal';
import { SubsidySentinel } from './panels/SubsidySentinel';
import { VoiceButton } from './ui/VoiceButton';

export const Dashboard = () => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto grid-pattern">
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
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
      </main>
      
      {/* Voice UI */}
      <VoiceButton />
    </div>
  );
};
