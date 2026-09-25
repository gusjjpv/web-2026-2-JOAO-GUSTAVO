import { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import {
  mockUserProfile,
  mockUserStats,
  mockUserGroups,
  type UserGroup,
} from '../../mock/userData';
import type { Route } from '../../App';

type NavTab = 'home' | 'groups' | 'alerts' | 'profile';

interface ProfilePageProps {
  navigate: (route: Route, state?: unknown) => void;
}

/**
 * Tela de Perfil do Usuário — RachaoApp
 * Figma node: 33-1304
 *
 * Estrutura (de cima para baixo):
 *  1. TopBar (cabeçalho #000F1E)
 *  2. Área de identificação: foto à esquerda | nome + posição + pé à direita — fundo #001D32
 *  3. Card "Meus status": rating em box com borda verde + grade 3×2 de stats
 *  4. Seção "Seus grupos" com título + "View All" + cards de grupos
 *  5. BottomNavBar com avatar na aba Você
 */
export function ProfilePage({ navigate }: ProfilePageProps) {
  const [activeNav, setActiveNav] = useState<NavTab>('profile');

  const handleNavChange = (tab: NavTab) => {
    setActiveNav(tab);
    if (tab === 'home') navigate('home');
  };

  const profile = mockUserProfile;
  const stats = mockUserStats;
  const groups = mockUserGroups;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      <TopBar />

      <main className="flex-1 overflow-y-auto pb-[55px]">

        {/* ── 1. Área de identificação do jogador ──────────────── */}
        <div
          className="w-full px-5 py-5"
          style={{ backgroundColor: '#001D32' }}
        >
          <div className="flex items-center gap-4">
            {/* Foto circular — sem borda */}
            <div
              className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
              style={{ width: 88, height: 88, backgroundColor: '#1A3A5C' }}
            >
              {profile.fotoPerfil ? (
                <img
                  src={profile.fotoPerfil}
                  alt={profile.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>

            {/* Nome + posição + pé */}
            <div className="flex flex-col gap-1">
              <h1 className="text-white font-semibold text-[20px] leading-tight">
                {profile.nome}
              </h1>
              {/* Posição e pé dominante na mesma linha */}
              <div className="flex items-center gap-6">
                <span className="text-[#9FB7D6] text-[14px]">
                  {profile.posicaoPrincipal}
                </span>
                <span className="text-[#9FB7D6] text-[14px]">
                  {profile.peDominante}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Card "Meus status" ────────────────────────────── */}
        <div className="px-4 pt-4">
          <div
            className="w-full rounded-[8px] p-4"
            style={{ backgroundColor: '#000F1E', border: '1px solid #40493D' }}
          >
            {/* Título */}
            <h2
              className="font-semibold text-[21px] mb-4"
              style={{ color: '#9FB7D6' }}
            >
              Meus status
            </h2>

            {/* Caixa de Rating centralizada */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div
                  className="flex items-center justify-center rounded-[8px]"
                  style={{
                    width: 189,
                    height: 95,
                    border: '4px solid #88D982',
                    backgroundColor: '#000F1E',
                  }}
                >
                  <span
                    className="font-bold leading-none"
                    style={{ fontSize: 34, color: '#88D982' }}
                  >
                    {stats.rating.toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Pill "Rating" sobreposta à borda inferior */}
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: 59,
                    height: 24,
                    backgroundColor: '#88D982',
                    bottom: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <span
                    className="text-[12px] font-bold"
                    style={{ color: '#000F1E' }}
                  >
                    Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Espaço para a pill não ficar cortada */}
            <div className="mt-6" />

            {/* Grade 3 × 2 de estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Partidas" value={stats.partidas} />
              <StatCard label="Gols" value={stats.gols} />
              <StatCard label="Assistências" value={stats.assistencias} />
              <StatCard label="Vitórias" value={stats.vitorias} />
              <StatCard label="Derrotas" value={stats.derrotas} />
              <StatCard label="Empates" value={stats.empates} />
            </div>
          </div>
        </div>

        {/* ── 3. Seção "Seus grupos" ───────────────────────────── */}
        <div className="px-4 pt-5 pb-4">
          {/* Cabeçalho da seção */}
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-semibold text-[21px]"
              style={{ color: '#9FB7D6' }}
            >
              Seus grupos
            </h2>
            <button
              type="button"
              className="text-[13px] font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#88D982' }}
              onClick={() => console.log('TODO: ver todos os grupos')}
            >
              View All
            </button>
          </div>

          {/* Lista de grupos */}
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>

      </main>

      <BottomNavBar
        active={activeNav}
        onTabChange={handleNavChange}
        userPhoto={profile.fotoPerfil}
      />
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

/** Card individual de estatística (sem borda, fundo #102A43) */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-[6px] py-3 px-2"
      style={{ backgroundColor: '#102A43' }}
    >
      <span
        className="font-bold text-[25px] leading-none"
        style={{ color: '#9FB7D6' }}
      >
        {value}
      </span>
      <span className="text-[12px] text-center leading-tight" style={{ color: '#6C7278' }}>
        {label}
      </span>
    </div>
  );
}

/** Gera as iniciais de um nome de grupo (máx 2 letras) */
function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Card de grupo com iniciais, nome, membros e próxima partida */
function GroupCard({ group }: { group: UserGroup }) {
  const initials = getInitials(group.nome);
  // Alterna cor de fundo das iniciais entre grupos
  const iconBg = group.isAdmin ? '#1A3A5C' : '#2D4A2D';

  return (
    <div
      className="w-full flex items-center gap-3 py-3 px-4 rounded-[8px]"
      style={{ backgroundColor: '#000F1E', border: '1px solid #40493D' }}
    >
      {/* Quadrado de iniciais */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-[8px]"
        style={{ width: 48, height: 48, backgroundColor: iconBg }}
      >
        {group.fotoCapa ? (
          <img
            src={group.fotoCapa}
            alt={group.nome}
            className="w-full h-full object-cover rounded-[8px]"
          />
        ) : (
          <span
            className="font-bold text-[16px]"
            style={{ color: '#9FB7D6' }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Nome + membros */}
      <div className="flex-1 min-w-0">
        <span
          className="block font-semibold text-[14px] truncate"
          style={{ color: '#9FB7D6' }}
        >
          {group.nome}
        </span>
        <span
          className="text-[12px]"
          style={{ color: '#6C7278' }}
        >
          {group.totalMembros} Members • Next match: Tomorrow
        </span>
      </div>

      {/* Seta */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C7278" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}
