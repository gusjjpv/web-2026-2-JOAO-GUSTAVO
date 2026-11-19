import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { TopBar } from '../../components/layout/TopBar';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import {
  formatarTempo,
  getHistoricoPartidas,
  getSessaoPartidaAtiva,
  mockJogadoresConfirmados,
} from '../../mock/matchData';
import type { Route } from '../../App';

type Modalidade = 'futsal' | 'society';
type GroupTab = 'membros' | 'ranking' | 'historico';
type NavTab = 'home' | 'groups' | 'alerts' | 'profile';

interface GroupData {
  nome: string;
  modalidades: Modalidade[];
  fotoCapa: string | null;
}

interface GroupDetailPageProps {
  navigate: (route: Route, state?: unknown) => void;
  groupData?: GroupData;
}

/**
 * Tela de Detalhe do Grupo — RachaoApp
 *
 * - Header com foto de capa + gradiente
 * - Nome do grupo e badges de modalidade
 * - Botão "Criar Racha" (TODO: próxima sprint)
 * - Abas: Membros | Ranking | Histórico (estado vazio)
 * - BottomNavBar com navegação funcional
 */
export function GroupDetailPage({ navigate, groupData }: GroupDetailPageProps) {
  const [activeTab, setActiveTab] = useState<GroupTab>('membros');
  const sessaoAtiva = getSessaoPartidaAtiva();

  const tabs: { id: GroupTab; label: string }[] = [
    { id: 'membros', label: 'Membros' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'historico', label: 'Histórico' },
  ];

  /* Conecta BottomNavBar à navegação entre telas */
  const handleNavChange = (tab: NavTab) => {
    if (tab === 'home') navigate('home');
    if (tab === 'profile') navigate('perfil');
    // outros tabs ainda sem tela própria
  };

  const modalidadeLabels: Record<Modalidade, string> = {
    futsal: 'Futsal',
    society: 'Society',
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      <TopBar />

      <main className="flex-1 flex flex-col pb-[55px] overflow-y-auto">

        {/* ── Capa ──────────────────────────────────────────────── */}
        <div className="relative">
          <div
            className="w-full"
            style={{
              height: 160,
              backgroundColor: '#000F1E',
              backgroundImage: groupData?.fotoCapa ? `url(${groupData.fotoCapa})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(16,42,67,0.95) 100%)' }}
            />
          </div>

          {/* Ícone fallback quando sem capa */}
          {!groupData?.fotoCapa && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
              style={{ width: 72, height: 72, backgroundColor: '#1A3A5C' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          )}
        </div>

        {/* ── Info + Criar Racha ────────────────────────────────── */}
        <div
          className="px-5 pt-4 pb-5 flex flex-col gap-3"
          style={{ backgroundColor: '#000F1E', borderBottom: '1px solid #40493D' }}
        >
          {/* Nome */}
          <h1 className="text-white font-bold text-[22px] leading-tight">
            {groupData?.nome ?? 'Meu Grupo'}
          </h1>

          {/* Badges de modalidade */}
          <div className="flex items-center gap-2 flex-wrap">
            {(groupData?.modalidades ?? []).map((mod) => (
              <span
                key={mod}
                className="text-[12px] font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: '#C6FF00', color: '#102A43' }}
              >
                {modalidadeLabels[mod]}
              </span>
            ))}
          </div>

          {/* Banner/CTA: Retomar Partida Pausada (se houver) */}
          {sessaoAtiva && (
            <button
              type="button"
              onClick={() => navigate('partida', { retomarSessao: true })}
              className="w-full p-3 rounded-[8px] bg-[#2E7D32] hover:brightness-110 text-left flex items-center justify-between gap-2 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[#CBFFC2] text-[13px] font-bold">
                  ▶ Retomar Partida {sessaoAtiva.numeroPartida} (Pausada)
                </span>
                <span className="text-white text-[12px]">
                  {sessaoAtiva.fila[0]?.nome} {sessaoAtiva.gols[0]} x {sessaoAtiva.gols[1]}{' '}
                  {sessaoAtiva.fila[1]?.nome}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-[6px] bg-[#001D32] text-[#88D982] text-[12px] font-semibold">
                Continuar →
              </span>
            </button>
          )}

          {/* CTA: Criar Racha */}
          <Button
            fullWidth
            style={{ borderRadius: 8, marginTop: 4 }}
            onClick={() =>
              navigate('criar-racha', {
                nome: groupData?.nome ?? 'Meu Grupo',
                modalidades: groupData?.modalidades ?? [],
                fotoCapa: groupData?.fotoCapa ?? null,
              })
            }
          >
            + Criar Racha
          </Button>

          {/* CTA: Sorteio de times → partida */}
          <Button
            fullWidth
            variant="outline"
            style={{ borderRadius: 8 }}
            onClick={() => navigate('sorteio')}
          >
            Sortear Times
          </Button>
        </div>

        {/* ── Abas ─────────────────────────────────────────────── */}
        <div
          className="flex border-b"
          style={{ borderColor: '#40493D', backgroundColor: '#000F1E' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 text-[13px] font-semibold transition-colors"
              style={{
                color: activeTab === tab.id ? '#C6FF00' : '#6C7278',
                borderBottom: activeTab === tab.id ? '2px solid #C6FF00' : '2px solid transparent',
                backgroundColor: 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Conteúdo da aba ──────────────────────────────────── */}
        <div className="flex-1 px-5 pt-5 pb-4">
          {activeTab === 'membros' && <MembrosTab />}
          {activeTab === 'ranking' && <RankingTab />}
          {activeTab === 'historico' && <HistoricoTab />}
        </div>
      </main>

      <BottomNavBar active="groups" onTabChange={handleNavChange} />
    </div>
  );
}

/* ── Componentes internos das abas ───────────────────────────────────────── */

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-3 rounded-[12px] py-10 px-4"
      style={{ backgroundColor: '#000F1E', border: '1px dashed #40493D' }}
    >
      <div style={{ color: '#40493D' }}>{icon}</div>
      <p className="text-[#6C7278] text-[13px] text-center">{message}</p>
    </div>
  );
}

function MembrosTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[#9FB7D6] text-[13px]">0 membros</span>
        <button type="button" disabled className="text-[#6C7278] text-[12px] font-medium opacity-50" title="Em breve">
          + Convidar
        </button>
      </div>
      <EmptyState
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="23" y1="11" x2="17" y2="11" />
            <line x1="20" y1="8" x2="20" y2="14" />
          </svg>
        }
        message="Nenhum membro ainda. Convide jogadores para começar!"
      />
    </div>
  );
}

function RankingTab() {
  const partidas = getHistoricoPartidas();
  const temEstatisticas =
    partidas.length > 0 ||
    mockJogadoresConfirmados.some((j) => (j.gols ?? 0) > 0 || (j.assistencias ?? 0) > 0);

  if (!temEstatisticas) {
    return (
      <EmptyState
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        }
        message="O ranking será gerado após o primeiro racha realizado."
      />
    );
  }

  const ordenados = [...mockJogadoresConfirmados].sort(
    (a, b) => b.rating - a.rating || (b.gols ?? 0) - (a.gols ?? 0),
  );

  return (
    <div className="flex flex-col gap-2">
      {ordenados.map((j, idx) => (
        <div
          key={j.id}
          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-[8px] bg-[#000F1E] border border-[#40493D]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-6 text-center text-[#88D982] text-[13px] font-bold">
              {idx + 1}º
            </span>
            <span className="text-[#CEE5FF] text-[14px] font-semibold truncate">
              {j.nome}
              {j.goleiro && ' (G)'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[#9FB7D6] text-[12px]">
              {j.gols ?? 0}G · {j.assistencias ?? 0}A
            </span>
            <span className="px-2 py-0.5 rounded-[10px] bg-[#88D982] text-[#003909] text-[13px] font-bold">
              {j.rating.toFixed(1)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoricoTab() {
  const partidas = getHistoricoPartidas();

  if (partidas.length === 0) {
    return (
      <EmptyState
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
        message="Nenhum racha realizado ainda. O histórico aparecerá aqui."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {partidas.map((p) => (
        <div
          key={p.id}
          className="rounded-[8px] bg-[#000F1E] border border-[#40493D] p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between text-[12px] text-[#9FB7D6]">
            <span className="font-semibold text-[#88D982]">Partida {p.numero}</span>
            <span>Duração: {formatarTempo(p.duracaoSegundos)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#001D32]">
            <span className="text-[#CEE5FF] text-[14px] font-semibold">{p.nomeTimeEsq}</span>
            <span className="text-white text-[16px] font-bold">
              {p.golsEsq} x {p.golsDir}
            </span>
            <span className="text-[#CEE5FF] text-[14px] font-semibold">{p.nomeTimeDir}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
