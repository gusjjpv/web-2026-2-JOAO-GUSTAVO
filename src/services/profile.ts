import { fetchAuthSession } from 'aws-amplify/auth';
import {
  getCurrentProfile,
  updateProfile,
  updateStats,
  type Modalidade,
  type PeDominante,
  type Posicao,
  type UserProfile,
} from '../mock/userData';

/**
 * URL base da HTTP API do API Gateway lida exclusivamente de VITE_PROFILE_API_URL (.env.local).
 * Aceita com ou sem protocolo ("https://..."), adicionando https:// automaticamente quando omitido.
 */
function resolveProfileEndpoint(): string {
  const raw = (import.meta.env.VITE_PROFILE_API_URL as string | undefined)?.trim();
  if (!raw) {
    throw new ProfileServiceError(
      'API de perfil não configurada. Defina VITE_PROFILE_API_URL no arquivo .env.local.',
    );
  }
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const normalized = withProtocol.replace(/\/+$/, '');
  return normalized.endsWith('/profile') ? normalized : `${normalized}/profile`;
}

export const isProfileApiConfigured = Boolean(
  (import.meta.env.VITE_PROFILE_API_URL as string | undefined)?.trim(),
);

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export class ProfileServiceError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ProfileServiceError';
    this.status = status;
  }
}

/** Estrutura do item salvo no DynamoDB pela Lambda. */
export interface ProfileApiItem {
  userId: string;
  nome: string;
  email: string;
  usuario: string;
  telefone: string;
  dataCadastro?: string;
  posicaoPrincipal: string;
  posicaoSecundaria: string;
  peDominante: string;
  modalidadePreferida: string;
  rating: number;
  qtdGols: number;
  qtdAssistencias: number;
  qtdPartidas: number;
  qtdVitorias?: number;
  qtdDerrotas?: number;
  qtdEmpate?: number;
  qtdEmpates?: number;
  photoKey: string | null;
  updatedAt?: string;
}

export interface SaveProfilePayload {
  nome?: string;
  email?: string;
  usuario?: string;
  telefone?: string;
  posicaoPrincipal?: string;
  posicaoSecundaria?: string;
  peDominante?: string;
  modalidadePreferida?: string;
  rating?: number;
  qtdGols?: number;
  qtdAssistencias?: number;
  qtdPartidas?: number;
  qtdVitorias?: number;
  qtdDerrotas?: number;
  qtdEmpate?: number;
}

interface PutProfileResponse {
  message?: string;
  profile?: ProfileApiItem;
  uploadUrl?: string | null;
  error?: string;
}

interface GetProfileRawResponse {
  profile?: ProfileApiItem | null;
  photoUrl?: string | null;
  imageUrl?: string | null;
  downloadUrl?: string | null;
  url?: string | null;
  userId?: string;
  nome?: string;
  email?: string;
  usuario?: string;
  telefone?: string;
  dataCadastro?: string;
  posicaoPrincipal?: string;
  posicaoSecundaria?: string;
  peDominante?: string;
  modalidadePreferida?: string;
  rating?: number;
  qtdGols?: number;
  qtdAssistencias?: number;
  qtdPartidas?: number;
  qtdVitorias?: number;
  qtdDerrotas?: number;
  qtdEmpate?: number;
  qtdEmpates?: number;
  photoKey?: string | null;
  error?: string;
}

/* ── Validação da imagem ────────────────────────────────────────────────── */

/** Valida tipo (JPEG/PNG/WebP) e tamanho (<= 2 MB) antes de chamar a Lambda. */
export function validateProfileImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Formato não permitido. Use JPG, PNG ou WebP.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'A imagem excede o limite de 2 MB.';
  }
  return null;
}

/* ── Helpers internos ───────────────────────────────────────────────────── */

async function getIdTokenAndClaims(): Promise<{
  idToken: string;
  claims: Record<string, unknown>;
}> {
  const session = await fetchAuthSession();
  const idTokenObj = session.tokens?.idToken;
  const idToken = idTokenObj?.toString();

  if (!idToken) {
    throw new ProfileServiceError('Sessão expirada. Faça login novamente.', 401);
  }

  return {
    idToken,
    claims: (idTokenObj?.payload as Record<string, unknown>) ?? {},
  };
}

function normalizePosicao(value: string | undefined, fallback: Posicao): Posicao {
  if (!value) return fallback;
  const map: Record<string, Posicao> = {
    goleiro: 'Goleiro',
    fixo: 'Fixo',
    ala: 'Ala',
    pivo: 'Pivô',
    pivô: 'Pivô',
    versatil: 'Versátil',
    versátil: 'Versátil',
    defensor: 'Defensor',
    'meio-campista': 'Meio-campista',
    atacante: 'Atacante',
  };
  return map[value.trim().toLowerCase()] ?? (value as Posicao);
}

function normalizePe(value: string | undefined, fallback: PeDominante): PeDominante {
  if (!value) return fallback;
  const map: Record<string, PeDominante> = {
    destro: 'Destro',
    canhoto: 'Canhoto',
    ambidestro: 'Ambidestro',
  };
  return map[value.trim().toLowerCase()] ?? (value as PeDominante);
}

function normalizeModalidade(value: string | undefined, fallback: Modalidade): Modalidade {
  if (!value) return fallback;
  const v = value.trim().toLowerCase();
  if (v === 'society' || v === 'futset') return 'society';
  if (v === 'futsal') return 'futsal';
  return fallback;
}

function syncProfileToStore(
  apiProfile: Partial<ProfileApiItem> | null,
  photoUrl?: string | null,
  claims?: Record<string, unknown>,
): UserProfile {
  const current = getCurrentProfile();

  const claimName = typeof claims?.name === 'string' ? claims.name : '';
  const claimEmail = typeof claims?.email === 'string' ? claims.email : '';
  const claimUsername =
    typeof claims?.['cognito:username'] === 'string' ? claims['cognito:username'] : '';
  const claimPhone = typeof claims?.phone_number === 'string' ? claims.phone_number : '';

  const nome = apiProfile?.nome || claimName || claimUsername || current.nome;
  const email = apiProfile?.email || claimEmail || current.email || '';
  const usuario = apiProfile?.usuario || claimUsername || current.usuario || '';
  const telefone = apiProfile?.telefone || claimPhone || current.telefone || '';

  const nextUpdates: Partial<UserProfile> = {
    id: apiProfile?.userId || current.id,
    nome,
    email,
    usuario,
    telefone,
    dataCadastro: apiProfile?.dataCadastro ?? current.dataCadastro,
    photoKey: apiProfile?.photoKey !== undefined ? apiProfile.photoKey : current.photoKey,
    posicaoPrincipal: normalizePosicao(apiProfile?.posicaoPrincipal, current.posicaoPrincipal),
    posicaoSecundaria: apiProfile?.posicaoSecundaria
      ? normalizePosicao(apiProfile.posicaoSecundaria, current.posicaoPrincipal)
      : apiProfile?.posicaoSecundaria === ''
        ? null
        : current.posicaoSecundaria,
    peDominante: normalizePe(apiProfile?.peDominante, current.peDominante),
    modalidadePreferida: normalizeModalidade(
      apiProfile?.modalidadePreferida,
      current.modalidadePreferida,
    ),
  };

  if (photoUrl !== undefined) {
    nextUpdates.fotoPerfil = photoUrl;
  }

  updateProfile(nextUpdates);

  if (apiProfile && apiProfile.userId) {
    updateStats({
      rating: Number(apiProfile.rating ?? 1000),
      partidas: Number(apiProfile.qtdPartidas ?? 0),
      gols: Number(apiProfile.qtdGols ?? 0),
      assistencias: Number(apiProfile.qtdAssistencias ?? 0),
      vitorias: Number(apiProfile.qtdVitorias ?? 0),
      derrotas: Number(apiProfile.qtdDerrotas ?? 0),
      empates: Number(apiProfile.qtdEmpates ?? apiProfile.qtdEmpate ?? 0),
    });
  }

  return getCurrentProfile();
}

async function safeParseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ── API Pública ────────────────────────────────────────────────────────── */

/**
 * Busca o perfil e a URL pré-assinada da foto do usuário via GET /profile.
 * Usa idToken no header Authorization para manter consistência com o authorizer.
 */
export async function fetchUserProfile(): Promise<{
  profile: UserProfile;
  photoUrl: string | null;
}> {
  const endpoint = resolveProfileEndpoint();
  const { idToken, claims } = await getIdTokenAndClaims();

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (res.status === 404) {
    // Usuário recém-cadastrado ainda não salvou perfil no DynamoDB; usa dados do Cognito.
    const profile = syncProfileToStore(null, undefined, claims);
    return { profile, photoUrl: profile.fotoPerfil };
  }

  const data = await safeParseJson<GetProfileRawResponse>(res);

  if (!res.ok) {
    throw new ProfileServiceError(
      data?.error || `Erro ao carregar perfil (${res.status}).`,
      res.status,
    );
  }

  const apiProfile: Partial<ProfileApiItem> | null =
    data?.profile !== undefined
      ? data.profile
      : data && (data.userId || data.nome !== undefined)
        ? data
        : null;

  const photoUrl =
    data?.photoUrl ?? data?.url ?? data?.downloadUrl ?? data?.imageUrl ?? undefined;

  const profile = syncProfileToStore(apiProfile, photoUrl, claims);
  return { profile, photoUrl: profile.fotoPerfil };
}

/**
 * Salva os dados do perfil no DynamoDB e, caso um arquivo de imagem seja enviado,
 * solicita a presigned URL no mesmo PUT /profile e realiza o upload binário ao S3.
 *
 * Fluxo:
 *  1. Valida tipo (image/jpeg, image/png, image/webp) e tamanho (<= 2 MB) da imagem.
 *  2. Envia PUT /profile com Authorization: Bearer <idToken> e JSON (dados + fileSize/fileType).
 *  3. Se a Lambda retornar uploadUrl, faz PUT do binário direto no S3 com Content-Type === file.type.
 *  4. Recarrega GET /profile para obter a URL de leitura atualizada do S3.
 */
export async function saveUserProfile(
  data: SaveProfilePayload,
  file?: File | null,
): Promise<{
  profile: UserProfile;
  photoUrl: string | null;
}> {
  if (file) {
    const validationError = validateProfileImage(file);
    if (validationError) {
      throw new ProfileServiceError(validationError, 400);
    }
  }

  const endpoint = resolveProfileEndpoint();
  const { idToken, claims } = await getIdTokenAndClaims();

  const payload: Record<string, unknown> = { ...data };

  // Preenche dados básicos do Cognito caso ainda não tenham sido informados
  if (!payload.email && typeof claims.email === 'string') {
    payload.email = claims.email;
  }
  if (!payload.usuario && typeof claims['cognito:username'] === 'string') {
    payload.usuario = claims['cognito:username'];
  }

  if (file) {
    payload.fileSize = file.size;
    payload.fileType = file.type;
  }

  // 1. Salva metadados / dados do perfil no DynamoDB e gera presigned URL (se houver imagem)
  const apiRes = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const apiData = await safeParseJson<PutProfileResponse>(apiRes);

  if (!apiRes.ok) {
    throw new ProfileServiceError(
      apiData?.error || `Erro ao salvar perfil (${apiRes.status}).`,
      apiRes.status,
    );
  }

  let resolvedPhotoUrl: string | null | undefined;

  // 2. Se há arquivo e a Lambda devolveu a uploadUrl, faz o PUT binário direto no S3
  if (file) {
    if (!apiData?.uploadUrl) {
      throw new ProfileServiceError('A API não retornou o link de upload da imagem.');
    }

    const s3Res = await fetch(apiData.uploadUrl, {
      method: 'PUT',
      headers: {
        // Obrigatório ser exatamente igual ao fileType enviado para a Lambda
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!s3Res.ok) {
      throw new ProfileServiceError(
        `Falha ao enviar a imagem para o S3 (${s3Res.status}).`,
        s3Res.status,
      );
    }

    // Preview imediato enquanto busca a URL pré-assinada de leitura
    resolvedPhotoUrl = URL.createObjectURL(file);
  }

  let synced = syncProfileToStore(apiData?.profile ?? null, resolvedPhotoUrl, claims);

  // 3. Após upload no S3, tenta buscar a URL pré-assinada de leitura via GET /profile
  if (file) {
    try {
      const refreshed = await fetchUserProfile();
      synced = refreshed.profile;
      if (refreshed.photoUrl) {
        resolvedPhotoUrl = refreshed.photoUrl;
      }
    } catch {
      // Mantém o preview local se a leitura imediata falhar
    }
  }

  return { profile: synced, photoUrl: synced.fotoPerfil };
}
