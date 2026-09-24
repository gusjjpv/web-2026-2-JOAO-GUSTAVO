import { TopBar } from '../../components/layout/TopBar';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import { Button } from '../../components/ui/Button';
import type { Route } from '../../App';

interface GroupData {
  nome: string;
  modalidade: 'futsal' | 'society';
  limiteVagas: number;
}

interface GroupDetailPageProps {
  navigate: (route: Route, state?: unknown) => void;
  groupData?: GroupData;
}

/**
 * Tela de Detalhe do Grupo — RachaoApp
 * Baseada no Figma 33-1092 (tela com membros e racha criado).
 * Adaptada para o estado vazio (logo após a criação do grupo):
 *  - Sem membros
 *  - Sem racha agendado
 *
 * Quando o Figma estiver acessível, ajustar o layout visual.
 */
export function GroupDetailPage({ navigate: _navigate, groupData }: GroupDetailPageProps) {
  const modalidadeLabel =
    groupData?.modalidade === 'society' ? 'Society' : 'Futsal';

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      <TopBar />

      <main className="flex-1 flex flex-col pb-[55px]">
        {/* Banner / cabeçalho do grupo */}
        <div
          className="w-full flex flex-col items-center justify-center py-8 gap-2"
          style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #40493D' }}
        >
          {/* Ícone do grupo */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#1A3A5C' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          {/* Nome do grupo */}
          <h1 className="text-white font-bold text-[20px] leading-tight text-center px-4">
            {groupData?.nome ?? 'Meu Grupo'}
          </h1>

          {/* Modalidade + limite */}
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: '#C6FF00', color: '#102A43' }}
            >
              {modalidadeLabel}
            </span>
            <span className="text-[#9FB7D6] text-[12px]">
              Até {groupData?.limiteVagas ?? '—'} vagas
            </span>
          </div>
        </div>

        {/* Seção: Próximo Racha Agendado */}
        <section className="px-5 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-[15px]">
              Próximo Racha
            </h2>
          </div>

          {/* Estado vazio — sem racha agendado */}
          <div
            className="w-full flex flex-col items-center justify-center gap-3 rounded-[12px] py-8 px-4"
            style={{ backgroundColor: '#000F1E', border: '1px dashed #40493D' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#40493D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-[#6C7278] text-[13px] text-center">
              Nenhum racha agendado ainda
            </p>
            {/* Desabilitado — próxima sprint */}
            <Button
              disabled
              style={{ width: 196, borderRadius: 8, opacity: 0.5 }}
              title="Em breve"
            >
              + Criar Racha Agendado
            </Button>
          </div>
        </section>

        {/* Seção: Membros */}
        <section className="px-5 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-[15px]">
              Membros
            </h2>
            {/* Desabilitado — próxima sprint */}
            <button
              type="button"
              disabled
              className="text-[#6C7278] text-[12px] font-medium"
              title="Em breve"
            >
              + Convidar
            </button>
          </div>

          {/* Estado vazio — sem membros */}
          <div
            className="w-full flex flex-col items-center justify-center gap-2 rounded-[12px] py-8 px-4"
            style={{ backgroundColor: '#000F1E', border: '1px dashed #40493D' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#40493D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="23" y1="11" x2="17" y2="11" />
              <line x1="20" y1="8" x2="20" y2="14" />
            </svg>
            <p className="text-[#6C7278] text-[13px] text-center">
              Nenhum membro ainda.{' '}
              <span className="text-[#9FB7D6]">Convide jogadores</span>{' '}
              para começar.
            </p>
          </div>
        </section>
      </main>

      <BottomNavBar active="groups" />
    </div>
  );
}
