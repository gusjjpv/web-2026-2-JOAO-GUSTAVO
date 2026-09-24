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
  fotoPerfil: string | null;
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

export const mockUserProfile: UserProfile = {
  id: 'usr-001',
  nome: 'João Gustavo',
  fotoPerfil: null,
  posicaoPrincipal: 'Ala',
  posicaoSecundaria: 'Pivô',
  peDominante: 'Destro',
  modalidadePreferida: 'futsal',
};

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
