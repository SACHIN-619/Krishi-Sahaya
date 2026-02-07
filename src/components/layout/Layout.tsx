import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { VoiceButton } from '@/components/ui/VoiceButton';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto grid-pattern">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
      <VoiceButton />
    </div>
  );
};
