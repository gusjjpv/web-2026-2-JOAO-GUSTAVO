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
 * Figma node: 33-1304
 *
 * Layout sem containers — elementos direto no fundo #102A43:
 *  - Banner de fundo + avatar centralizado
 *  - Nome, posições e pé dominante soltos na tela
 *  - Linha separadora
 *  - Bloco de estatísticas (rating + grade de stats)
 *  - Lista de grupos
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

        {/* ── Banner + Avatar ──────────────────────────────────── */}
        <div className="relative">
          {/* Banner de cor */}
          <div
            className="w-full"
            style={{
              height: 120,
              background: 'linear-gradient(135deg, #009951 0%, #102A43 100%)',
            }}
          />

          {/* Avatar centralizado sobre o banner */}
          <div className="flex justify-center" style={{ marginTop: -44 }}>
            <div
              className="flex items-center justify-center rounded-full border-4 overflow-hidden"
              style={{
                width: 88,
                height: 88,
                backgroundColor: '#1A3A5C',
                borderColor: '#102A43',
              }}
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
          </div>
        </div>

        {/* ── Identidade ──────────────────────────────────────── */}
        <div className="flex flex-col items-center px-6 mt-3 gap-1">
          {/* Nome */}
          <h1 className="text-white font-bold text-[22px] leading-tight text-center">
            {profile.nome}
          </h1>

          {/* Posições */}
          <p className="text-[#9FB7D6] text-[13px] text-center">
            {profile.posicaoPrincipal}
            {profile.posicaoSecundaria ? ` · ${profile.posicaoSecundaria}` : ''}
          </p>

          {/* Pé dominante */}
          <p className="text-[#6C7278] text-[12px] text-center">
            Pé {profile.peDominante}
          </p>

          {/* Botão editar */}
          <button
            type="button"
            className="mt-3 text-[12px] font-semibold px-5 py-1.5 rounded-full border transition-colors hover:opacity-80"
            style={{ color: '#C6FF00', borderColor: '#C6FF00' }}
            onClick={() => console.log('TODO: editar perfil')}
          >
            Editar perfil
          </button>
        </div>

        {/* ── Separador ───────────────────────────────────────── */}
        <div
          className="mx-6 my-5"
          style={{ height: 1, backgroundColor: '#40493D' }}
        />

        {/* ── Estatísticas ────────────────────────────────────── */}
        <div className="px-6">
          {/* Rating em destaque */}
          <div className="flex items-baseline justify-center gap-2 mb-5">
            <span
              className="font-bold leading-none"
              style={{ fontSize: 48, color: '#C6FF00' }}
            >
              {stats.rating.toLocaleString('pt-BR')}
            </span>
            <span className="text-[#6C7278] text-[13px] font-medium mb-1">
              pts
            </span>
          </div>

          {/* Grade 3 × 2 */}
          <div className="grid grid-cols-3 gap-3">
            <StatItem label="Partidas" value={stats.partidas} />
            <StatItem label="Gols" value={stats.gols} highlight />
            <StatItem label="Assistências" value={stats.assistencias} />
            <StatItem label="Vitórias" value={stats.vitorias} color="#009951" />
            <StatItem label="Derrotas" value={stats.derrotas} color="#EF4444" />
            <StatItem label="Empates" value={stats.empates} color="#9FB7D6" />
          </div>
        </div>

        {/* ── Separador ───────────────────────────────────────── */}
        <div
          className="mx-6 my-5"
          style={{ height: 1, backgroundColor: '#40493D' }}
        />

        {/* ── Grupos ──────────────────────────────────────────── */}
        <div className="px-6 pb-4">
          <h2 className="text-white font-semibold text-[15px] mb-3">
            Meus Grupos
          </h2>

          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <GroupRow key={group.id} group={group} />
            ))}
          </div>
        </div>

      </main>

      <BottomNavBar active={activeNav} onTabChange={handleNavChange} />
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function StatItem({
  label,
  value,
  highlight = false,
  color,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  color?: string;
}) {
  const valueColor = color ?? (highlight ? '#C6FF00' : '#FFFFFF');
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-bold text-[24px] leading-none"
        style={{ color: valueColor }}
      >
        {value}
      </span>
      <span className="text-[#6C7278] text-[11px] text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

function GroupRow({ group }: { group: UserGroup }) {
  const modalidadeLabels = group.modalidades
    .map((m) => MODALIDADE_LABEL[m])
    .join(' · ');

  return (
    <div
      className="w-full flex items-center gap-3 py-3 px-4 rounded-[12px]"
      style={{ backgroundColor: '#000F1E', border: '1px solid #40493D' }}
    >
      {/* Ícone do grupo */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-[10px] overflow-hidden"
        style={{
          width: 44,
          height: 44,
          backgroundColor: '#1A3A5C',
          backgroundImage: group.fotoCapa ? `url(${group.fotoCapa})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!group.fotoCapa && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Chevron */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#40493D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}
