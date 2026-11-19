import { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import { PlayerRow } from '../../components/match/PlayerRow';
import { EditTeamsModal } from '../../components/match/EditTeamsModal';
import {
  getRegrasRacha,
  mockJogadoresConfirmados,
  ratingTotal,
  salvarSessaoPartidaAtiva,
  sortearTimes,
  type Jogador,
  type PartidaNavState,
  type RegrasRacha,
  type Time,
} from '../../mock/matchData';
import { getCurrentProfile } from '../../mock/userData';
import type { Route } from '../../App';

type NavTab = 'home' | 'groups' | 'alerts' | 'profile';

interface SorteioPageProps {
  navigate: (route: Route, state?: unknown) => void;
  regras?: RegrasRacha;
}

/** Cor do badge de rating conforme o Figma: goleiro azul, demais verde. */
function RatingBadge({ jogador }: { jogador: Jogador }) {
  const estilo = jogador.goleiro
    ? 'bg-[#B0C9E8] text-[#19324B]'
    : jogador.rating >= 4.4
      ? 'bg-[#88D982] text-[#003909]'
      : 'bg-[#88D982] text-[#005312]';
  return (
    <span className={`flex-shrink-0 px-2 py-1 rounded-[12px] text-[14px] font-semibold leading-5 ${estilo}`}>
      {jogador.rating.toFixed(1)}
    </span>
  );
}

function TeamCard({ time, destaque }: { time: Time; destaque: boolean }) {
  return (
    <section
      className="rounded-[8px] overflow-hidden bg-[#000F1E] border border-[#40493D]"
      style={{ borderLeft: `8px solid ${destaque ? '#C6FF00' : '#314863'}` }}
    >
      <header className="flex items-center justify-between px-4 pt-4 pb-5 border-b border-[#40493D]">
        <h2 className="text-[#CEE5FF] text-[20px] font-semibold leading-7">{time.nome}</h2>
        <span
          className={`px-2 py-1 rounded-[12px] text-[12px] font-bold leading-4 ${
            destaque ? 'bg-[#C6FF00] text-[#102A43]' : 'bg-[#1B374F] text-[#BFCABA]'
          }`}
        >
          {time.jogadores.length} Jogadores
        </span>
      </header>

      <div className="bg-[#1F3B54] p-2 flex flex-col gap-2">
        {time.jogadores.map((j) => (
          <PlayerRow key={j.id} jogador={j} badge={<RatingBadge jogador={j} />} />
        ))}
      </div>

      <footer className="flex items-center justify-between p-4 bg-[#001526] border-t border-[#40493D]">
        <span className="text-[#BFCABA] text-[14px] font-semibold leading-5 tracking-[0.05em] uppercase">
          Rating Total
        </span>
        <span className={`text-[24px] font-bold leading-8 ${destaque ? 'text-white' : 'text-[#CEE5FF]'}`}>
          {ratingTotal(time).toFixed(1)}
        </span>
      </footer>
    </section>
  );
}

/**
 * Tela de Sorteio de Times — RachaoApp
 * Figma node: 33-1212
 *
 * - Toggle "Equilibrar por Rating" (sorteio balanceado x aleatório)
 * - Cards dos times com jogadores, rating individual e rating total
 * - "Refazer Sorteio" gera nova combinação; "Iniciar Partidas" abre a tela de jogo
 */
export function SorteioPage({ navigate, regras }: SorteioPageProps) {
  // TODO: substituir pelo GET dos jogadores confirmados na ocorrência do racha
  const jogadores = mockJogadoresConfirmados;
  const regrasEfetivas = { ...getRegrasRacha(), ...regras };
  const [equilibrar, setEquilibrar] = useState(true);
  const [times, setTimes] = useState<Time[]>(() =>
    sortearTimes(jogadores, regrasEfetivas.vagasPorTime, true),
  );
  const [jogadoresAusentes, setJogadoresAusentes] = useState<Jogador[]>([]);
  const [modalEditarTimes, setModalEditarTimes] = useState(false);

  const refazer = (balancear = equilibrar) => {
    setJogadoresAusentes([]);
    setTimes(sortearTimes(mockJogadoresConfirmados, regrasEfetivas.vagasPorTime, balancear));
  };

  const alternarEquilibrio = () => {
    const novo = !equilibrar;
    setEquilibrar(novo);
    refazer(novo);
  };

  const iniciarPartidas = () => {
    salvarSessaoPartidaAtiva(null);
    const state: PartidaNavState = { times, regras: regrasEfetivas };
    navigate('partida', state);
  };

  const handleMoverJogador = (jogadorId: string, timeOrigemId: string, timeDestinoId: string) => {
    if (timeOrigemId === timeDestinoId) return;
    setTimes((prev) => {
      let movido: Jogador | null = null;
      const semOrigem = prev.map((t) => {
        if (t.id !== timeOrigemId) return t;
        const encontrado = t.jogadores.find((j) => j.id === jogadorId);
        if (encontrado) movido = encontrado;
        return { ...t, jogadores: t.jogadores.filter((j) => j.id !== jogadorId) };
      });
      if (!movido) return prev;
      return semOrigem.map((t) =>
        t.id === timeDestinoId ? { ...t, jogadores: [...t.jogadores, movido!] } : t,
      );
    });
  };

  const handleRemoverJogador = (jogadorId: string, timeOrigemId: string) => {
    setTimes((prev) =>
      prev.map((t) => {
        if (t.id !== timeOrigemId) return t;
        const saindo = t.jogadores.find((j) => j.id === jogadorId);
        if (saindo) {
          setJogadoresAusentes((aus) =>
            aus.some((x) => x.id === saindo.id) ? aus : [...aus, saindo],
          );
        }
        return { ...t, jogadores: t.jogadores.filter((j) => j.id !== jogadorId) };
      }),
    );
  };

  const handleReintegrarAusente = (jogadorId: string, timeDestinoId: string) => {
    const jogador = jogadoresAusentes.find((j) => j.id === jogadorId);
    if (!jogador) return;
    setJogadoresAusentes((prev) => prev.filter((j) => j.id !== jogadorId));
    setTimes((prev) =>
      prev.map((t) =>
        t.id === timeDestinoId ? { ...t, jogadores: [...t.jogadores, jogador] } : t,
      ),
    );
  };

  const handleAdicionarAtrasado = (novoJogador: Jogador, timeDestinoId: string) => {
    setTimes((prev) =>
      prev.map((t) =>
        t.id === timeDestinoId ? { ...t, jogadores: [...t.jogadores, novoJogador] } : t,
      ),
    );
  };

  const handleNavChange = (tab: NavTab) => {
    if (tab === 'home') navigate('home');
    if (tab === 'groups') navigate('detalhe-grupo');
    if (tab === 'profile') navigate('perfil');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#102A43]">
      <TopBar />

      <main className="flex-1 w-full max-w-[420px] mx-auto flex flex-col gap-6 px-4 pt-6 pb-[90px]">
        {/* ── Cabeçalho ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#CEE5FF] text-[32px] font-bold leading-10 tracking-[-0.01em]">
              Sorteio de Times
            </h1>
            <p className="text-[#BFCABA] text-[16px] leading-6">
              Confira o balanceamento dos times para a partida.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={equilibrar}
            onClick={alternarEquilibrio}
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#001D32] border border-[#40493D] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-left"
          >
            <svg width="20" height="19" viewBox="0 0 24 24" fill="#88D982" aria-hidden>
              <path d="M12 3c-.55 0-1 .45-1 1v1.07A2.99 2.99 0 0 0 9.18 7H5.82L3.09 13.39A1 1 0 0 0 3 13.8C3 15.57 4.57 17 6.5 17S10 15.57 10 13.8a1 1 0 0 0-.09-.41L7.62 9h1.56A3 3 0 0 0 11 10.93V19H7v2h10v-2h-4v-8.07A3 3 0 0 0 14.82 9h1.56l-2.29 4.39a1 1 0 0 0-.09.41c0 1.77 1.57 3.2 3.5 3.2s3.5-1.43 3.5-3.2a1 1 0 0 0-.09-.41L18.18 7h-3.36A2.99 2.99 0 0 0 13 5.07V4c0-.55-.45-1-1-1zM6.5 10.7l1.62 3.1H4.88L6.5 10.7zm11 0 1.62 3.1h-3.24l1.62-3.1z" />
            </svg>
            <span className="flex-1 text-[#CEE5FF] text-[14px] font-semibold leading-5">
              Equilibrar por Rating {equilibrar ? '(Ativo)' : '(Inativo)'}
            </span>
            <span
              className={`relative w-11 h-6 rounded-[12px] transition-colors ${equilibrar ? 'bg-[#2E7D32]' : 'bg-[#40493D]'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${equilibrar ? 'left-[22px]' : 'left-0.5'}`}
              />
            </span>
          </button>
        </div>

        {/* ── Times ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {times.map((t, i) => (
            <TeamCard key={t.id} time={t} destaque={i === 0} />
          ))}
        </div>

        {/* ── Ações ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pt-6 border-t border-[#40493D]">
          <button
            type="button"
            onClick={() => setModalEditarTimes(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[4px] bg-[#001D32] border border-[#40493D] text-[#CEE5FF] text-[14px] font-semibold leading-5 hover:bg-[#012138] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar Times / Realocar Jogadores
          </button>

          <button
            type="button"
            onClick={() => refazer()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[4px] bg-white border border-[#102A43] text-[#102A43] text-[14px] font-semibold leading-5 hover:opacity-90 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refazer Sorteio
          </button>

          <button
            type="button"
            onClick={iniciarPartidas}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[4px] bg-[#C6FF00] text-[#102A43] text-[14px] font-bold leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:opacity-90 transition-opacity"
          >
            <svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
              <path d="M0 0v14l11-7z" />
            </svg>
            Iniciar Partidas
          </button>
        </div>
      </main>

      <BottomNavBar
        active="groups"
        onTabChange={handleNavChange}
        userPhoto={getCurrentProfile().fotoPerfil}
      />

      {modalEditarTimes && (
        <EditTeamsModal
          times={times}
          jogadoresAusentes={jogadoresAusentes}
          vagasPorTime={regrasEfetivas.vagasPorTime}
          onMoverJogador={handleMoverJogador}
          onRemoverJogador={handleRemoverJogador}
          onReintegrarAusente={handleReintegrarAusente}
          onAdicionarAtrasado={handleAdicionarAtrasado}
          onClose={() => setModalEditarTimes(false)}
        />
      )}
    </div>
  );
}
