import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/hooks/useTheme';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import DashboardPage from '@/pages/DashboardPage';
import MarketPage from '@/pages/MarketPage';
import AdvisoryPage from '@/pages/AdvisoryPage';
import SchemesPage from '@/pages/SchemesPage';
import DiagnosisPage from '@/pages/DiagnosisPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Layout>
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

export default App;
