/**
 * Dados mock do usuário — substitui chamadas de API enquanto o backend não existe.
 * Baseado nos campos definidos no documento de visão e requisitos (RF-02, RF-03).
 */

export type Posicao =
  | 'Goleiro'
  | 'Fixo'
  | 'Ala'
  | 'Pivô'
  | 'Versátil'
  | 'Defensor'
  | 'Meio-campista'
  | 'Atacante';

export type PeDominante = 'Destro' | 'Canhoto' | 'Ambidestro';
export type Modalidade = 'futsal' | 'society';

export interface UserProfile {
  id: string;
  nome: string;
  email?: string;
  usuario?: string;
  telefone?: string;
  fotoPerfil: string | null;
  photoKey?: string | null;
  dataCadastro?: string;
  posicaoPrincipal: Posicao;
  posicaoSecundaria: Posicao | null;
  peDominante: PeDominante;
  modalidadePreferida: Modalidade;
}

export interface UserStats {
  rating: number;
  partidas: number;
  gols: number;
  assistencias: number;
  vitorias: number;
  derrotas: number;
  empates: number;
}

export interface UserGroup {
  id: string;
  nome: string;
  modalidades: Modalidade[];
  fotoCapa: string | null;
  totalMembros: number;
  isAdmin: boolean;
}

/* ── Mock data ──────────────────────────────────────────────────────────── */

export const mockUserStats: UserStats = {
  rating: 1124,
  partidas: 38,
  gols: 47,
  assistencias: 23,
  vitorias: 21,
  derrotas: 11,
  empates: 6,
};

export const mockUserGroups: UserGroup[] = [
  {
    id: 'grp-001',
    nome: 'Racha da Sexta',
    modalidades: ['futsal'],
    fotoCapa: null,
    totalMembros: 18,
    isAdmin: true,
  },
  {
    id: 'grp-002',
    nome: 'Pelada do Bairro',
    modalidades: ['society'],
    fotoCapa: null,
    totalMembros: 24,
    isAdmin: false,
  },
  {
    id: 'grp-003',
    nome: 'Fut da Galera',
    modalidades: ['futsal', 'society'],
    fotoCapa: null,
    totalMembros: 12,
    isAdmin: false,
  },
];

/* ── Store em memória do perfil do usuário ──────────────────────────────── */
// Cache local sincronizado com a API Gateway / DynamoDB / S3 (src/services/profile.ts).

const INITIAL_PROFILE: UserProfile = {
  id: 'usr-001',
  nome: 'Atleta',
  email: '',
  usuario: '',
  telefone: '',
  fotoPerfil: null,
  photoKey: null,
  posicaoPrincipal: 'Ala',
  posicaoSecundaria: null,
  peDominante: 'Destro',
  modalidadePreferida: 'futsal',
};

const INITIAL_STATS: UserStats = {
  rating: 1000,
  partidas: 0,
  gols: 0,
  assistencias: 0,
  vitorias: 0,
  derrotas: 0,
  empates: 0,
};

let _profile: UserProfile = { ...INITIAL_PROFILE };
let _stats: UserStats = { ...INITIAL_STATS };

/** Retorna uma cópia imutável do perfil atual. */
export function getCurrentProfile(): UserProfile {
  return { ..._profile };
}

/** Atualiza o perfil em memória (chamado ao carregar da API ou salvar edições). */
export function updateProfile(updates: Partial<UserProfile>): void {
  _profile = { ..._profile, ...updates };
}

/** Retorna uma cópia imutável das estatísticas atuais do usuário. */
export function getCurrentStats(): UserStats {
  return { ..._stats };
}

/** Atualiza as estatísticas em memória a partir da resposta do DynamoDB. */
export function updateStats(updates: Partial<UserStats>): void {
  _stats = { ..._stats, ...updates };
}

/** Limpa o cache local ao encerrar a sessão (logout). */
export function resetProfileStore(): void {
  _profile = { ...INITIAL_PROFILE };
  _stats = { ...INITIAL_STATS };
}

/** @deprecated Use getCurrentProfile() em vez desta constante. */
export const mockUserProfile: UserProfile = _profile;
