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

const MODALIDADE_LABEL: Record<string, string> = {
  futsal: 'Futsal',
  society: 'Society',
};

/**
 * Tela de Perfil do Usuário — RachaoApp
 *
 * Seções:
 *  1. Card de identidade: foto | nome | posições | pé dominante
 *  2. Card de estatísticas: rating | partidas | gols | assistências | V/D/E
 *  3. Lista de grupos que o usuário participa
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
        <div className="flex flex-col gap-4 px-4 pt-5 pb-6">

          {/* ── 1. Card de Identidade ──────────────────────────── */}
          <section
            className="w-full rounded-[16px] overflow-hidden"
            style={{ backgroundColor: '#000F1E', border: '1px solid #40493D' }}
          >
            {/* Banner superior */}
            <div
              className="w-full h-[72px]"
              style={{ background: 'linear-gradient(135deg, #009951 0%, #102A43 100%)' }}
            />

            <div className="px-5 pb-5">
              {/* Avatar */}
              <div className="flex items-end justify-between" style={{ marginTop: -36 }}>
                <div
                  className="flex items-center justify-center rounded-full border-4 overflow-hidden flex-shrink-0"
                  style={{
                    width: 72,
                    height: 72,
                    backgroundColor: '#1A3A5C',
                    borderColor: '#000F1E',
                  }}
                >
                  {profile.fotoPerfil ? (
                    <img
                      src={profile.fotoPerfil}
                      alt={profile.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                {/* Botão editar */}
                <button
                  type="button"
                  className="text-[12px] font-medium px-3 py-1 rounded-full border transition-colors hover:opacity-80"
                  style={{ color: '#C6FF00', borderColor: '#C6FF00' }}
                  onClick={() => console.log('TODO: editar perfil')}
                >
                  Editar
                </button>
              </div>

              {/* Nome */}
              <h1 className="text-white font-bold text-[20px] leading-tight mt-3">
                {profile.nome}
              </h1>

              {/* Posições + pé dominante */}
              <div className="flex flex-col gap-2 mt-3">
                <InfoRow
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </svg>
                  }
                  label="Posição principal"
                  value={profile.posicaoPrincipal}
                />
                {profile.posicaoSecundaria && (
                  <InfoRow
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4l3 3" />
                      </svg>
                    }
                    label="Posição secundária"
                    value={profile.posicaoSecundaria}
                  />
                )}
                <InfoRow
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  }
                  label="Pé dominante"
                  value={profile.peDominante}
                />
              </div>
            </div>
          </section>

          {/* ── 2. Card de Estatísticas ───────────────────────── */}
          <section
            className="w-full rounded-[16px] p-5"
            style={{ backgroundColor: '#000F1E', border: '1px solid #40493D' }}
          >
            {/* Rating em destaque */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#9FB7D6] text-[13px] font-medium">Rating</span>
              <span
                className="font-bold text-[28px] leading-none"
                style={{ color: '#C6FF00' }}
              >
                {stats.rating.toLocaleString('pt-BR')}
              </span>
            </div>

            <div
              className="w-full h-px mb-4"
              style={{ backgroundColor: '#40493D' }}
            />

            {/* Grade de estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Partidas" value={stats.partidas} />
              <StatCard label="Gols" value={stats.gols} accent />
              <StatCard label="Assistências" value={stats.assistencias} />
              <StatCard label="Vitórias" value={stats.vitorias} color="#009951" />
              <StatCard label="Derrotas" value={stats.derrotas} color="#EF4444" />
              <StatCard label="Empates" value={stats.empates} color="#9FB7D6" />
            </div>
          </section>

          {/* ── 3. Lista de Grupos ────────────────────────────── */}
          <section className="w-full">
            <h2 className="text-white font-semibold text-[15px] mb-3">
              Meus Grupos
            </h2>

            <div className="flex flex-col gap-3">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </section>

        </div>
      </main>

      <BottomNavBar active={activeNav} onTabChange={handleNavChange} />
    </div>
  );
}

/* ── Sub-componentes internos ────────────────────────────────────────────── */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: '#6C7278' }}>{icon}</span>
      <span className="text-[#6C7278] text-[12px]">{label}:</span>
      <span className="text-[#BFCABA] text-[12px] font-medium">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
  color,
}: {
  label: string;
  value: number;
  accent?: boolean;
  color?: string;
}) {
  const valueColor = color ?? (accent ? '#C6FF00' : '#FFFFFF');
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-[12px] py-3 px-2"
      style={{ backgroundColor: '#102A43' }}
    >
      <span className="font-bold text-[20px] leading-none" style={{ color: valueColor }}>
        {value}
      </span>
      <span className="text-[#6C7278] text-[11px] text-center leading-tight">{label}</span>
    </div>
  );
}

function GroupCard({ group }: { group: UserGroup }) {
  const modalidadeLabels = group.modalidades
    .map((m) => MODALIDADE_LABEL[m])
    .join(' · ');

  return (
    <div
      className="w-full flex items-center gap-3 rounded-[12px] p-4"
      style={{ backgroundColor: '#000F1E', border: '1px solid #40493D' }}
    >
      {/* Ícone / capa do grupo */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-[10px] overflow-hidden"
        style={{
          width: 48,
          height: 48,
          backgroundColor: '#1A3A5C',
          backgroundImage: group.fotoCapa ? `url(${group.fotoCapa})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!group.fotoCapa && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-[14px] truncate">
            {group.nome}
          </span>
          {group.isAdmin && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#C6FF00', color: '#102A43' }}
            >
              Admin
            </span>
          )}
        </div>
        <span className="text-[#6C7278] text-[12px]">
          {modalidadeLabels} · {group.totalMembros} membros
        </span>
      </div>

      {/* Seta */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#40493D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}
