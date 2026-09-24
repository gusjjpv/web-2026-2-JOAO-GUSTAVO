import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { TopBar } from '../../components/layout/TopBar';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import type { Route } from '../../App';

type NavTab = 'home' | 'groups' | 'alerts' | 'profile';

interface HomePageProps {
  navigate: (route: Route) => void;
}

/**
 * Tela inicial vazia — RachaoApp
 * Figma node: 44-312
 */
export function HomePage({ navigate: _navigate }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Barra superior */}
      <TopBar />

      {/* Conteúdo central */}
      <main
        className="flex-1 flex flex-col items-center justify-center gap-[18px]"
        style={{ paddingBottom: 55 }}
      >
        <Button
          style={{ width: 196, borderRadius: 8 }}
          onClick={() => console.log('Encontre um Racha')}
        >
          Encontre um Racha
        </Button>

        <Button
          style={{ width: 194, borderRadius: 4 }}
          onClick={() => console.log('Criar um Racha')}
        >
          Criar um Racha
        </Button>
      </main>

      {/* Barra de navegação inferior */}
      <BottomNavBar active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
