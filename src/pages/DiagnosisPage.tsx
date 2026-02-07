import { Leaf } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { DiagnosisPortal } from '@/components/panels/DiagnosisPortal';

const DiagnosisPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('diagnosis')}</h1>
          <p className="text-muted-foreground text-sm">AI-powered crop disease detection and treatment</p>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="relative rounded-xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=250&fit=crop"
          alt="Crop diagnosis"
          className="w-full h-40 md:h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Visual Disease Detection</h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Upload a photo of your affected crop and get instant AI-powered diagnosis with verified treatment recommendations.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnosis Portal */}
        <div className="lg:col-span-2">
          <DiagnosisPortal />
        </div>
        
        {/* Recent Diagnoses & Tips */}
        <div className="space-y-6">
          {/* Recent Diagnoses */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-4">Recent Diagnoses</h3>
            <div className="space-y-3">
              {[
                { crop: 'Tomato', disease: 'Early Blight', severity: 'Medium', time: '2 hours ago', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=60&h=60&fit=crop' },
                { crop: 'Rice', disease: 'Blast', severity: 'High', time: '5 hours ago', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=60&h=60&fit=crop' },
                { crop: 'Cotton', disease: 'Healthy', severity: 'None', time: '1 day ago', image: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=60&h=60&fit=crop' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
                  <img 
                    src={item.image} 
                    alt={item.crop}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.crop}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.disease}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.severity === 'High' ? 'bg-destructive/20 text-destructive' :
                      item.severity === 'Medium' ? 'bg-alert/20 text-alert' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {item.severity}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-4">Photo Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Take clear, well-lit photos of affected areas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Include both healthy and diseased parts
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Capture from multiple angles if possible
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Avoid blurry or over-exposed images
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisPage;
