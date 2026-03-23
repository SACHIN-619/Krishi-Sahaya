import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/useTheme';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MarketPage from '@/pages/MarketPage';
import AdvisoryPage from '@/pages/AdvisoryPage';
import SchemesPage from '@/pages/SchemesPage';
import DiagnosisPage from '@/pages/DiagnosisPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

interface User { name: string; phone: string; email: string }

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('krishi_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('krishi_user'); }
    }
    setChecking(false);
  }, []);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem('krishi_user');
    setUser(null);
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
    </div>
  );

  if (!user) return (
    <ThemeProvider>
      <LoginPage onLogin={handleLogin} />
    </ThemeProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/market" element={<MarketPage />} />
                  <Route path="/advisory" element={<AdvisoryPage />} />
                  <Route path="/schemes" element={<SchemesPage />} />
                  <Route path="/diagnosis" element={<DiagnosisPage />} />
                </Routes>
              </Layout>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
