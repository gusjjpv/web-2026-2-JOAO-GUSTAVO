import { useEffect, useState, useRef, type FormEvent } from 'react';
import { InputField } from '../../components/ui/InputField';
import { Dropdown } from '../../components/ui/Dropdown';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { Button } from '../../components/ui/Button';
import {
  getCurrentProfile,
  type Posicao,
  type PeDominante,
  type Modalidade,
} from '../../mock/userData';
import {
  ALLOWED_IMAGE_TYPES,
  ProfileServiceError,
  fetchUserProfile,
  saveUserProfile,
  validateProfileImage,
} from '../../services/profile';
import type { Route } from '../../App';

interface EditProfilePageProps {
  navigate: (route: Route, state?: unknown) => void;
}

interface EditForm {
  nome: string;
  telefone: string;
  fotoPerfil: string | null;
  posicaoPrincipal: Posicao | '';
  posicaoSecundaria: Posicao | '';
  peDominante: PeDominante | '';
  modalidadePreferida: Modalidade;
}

type FormErrors = Partial<Record<'nome' | 'posicaoPrincipal' | 'peDominante', string>>;

/* ── Opções dos selects ─────────────────────────────────────────────────── */

const POSICOES_FUTSAL = [
  { label: 'Goleiro', value: 'Goleiro' },
  { label: 'Fixo', value: 'Fixo' },
  { label: 'Ala', value: 'Ala' },
  { label: 'Pivô', value: 'Pivô' },
  { label: 'Versátil', value: 'Versátil' },
];

const POSICOES_SOCIETY = [
  { label: 'Goleiro', value: 'Goleiro' },
  { label: 'Defensor', value: 'Defensor' },
  { label: 'Meio-campista', value: 'Meio-campista' },
  { label: 'Atacante', value: 'Atacante' },
  { label: 'Versátil', value: 'Versátil' },
];

const OPCOES_PE: { label: string; value: PeDominante }[] = [
  { label: 'Destro', value: 'Destro' },
  { label: 'Canhoto', value: 'Canhoto' },
  { label: 'Ambidestro', value: 'Ambidestro' },
];

const OPCOES_MODALIDADE: { label: string; value: Modalidade }[] = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Society', value: 'society' },
];

/**
 * Tela de Edição de Perfil — RachaoApp
 * (RF-02 — Gerenciamento do Perfil de Atleta)
 *
 * Salva dados no DynamoDB e faz upload da imagem para o S3 via PUT /profile + Presigned URL.
 */
export function EditProfilePage({ navigate }: EditProfilePageProps) {
  const currentProfile = getCurrentProfile();
  const [form, setForm] = useState<EditForm>({
    nome: currentProfile.nome,
    telefone: currentProfile.telefone ?? '',
    fotoPerfil: currentProfile.fotoPerfil,
    posicaoPrincipal: currentProfile.posicaoPrincipal,
    posicaoSecundaria: currentProfile.posicaoSecundaria ?? '',
    peDominante: currentProfile.peDominante,
    modalidadePreferida: currentProfile.modalidadePreferida,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o formulário com os dados mais recentes da API ao abrir a tela
  useEffect(() => {
    let active = true;
    fetchUserProfile()
      .then(({ profile }) => {
        if (!active) return;
        setForm((prev) => ({
          ...prev,
          nome: profile.nome || prev.nome,
          telefone: profile.telefone ?? prev.telefone,
          fotoPerfil: selectedFile ? prev.fotoPerfil : profile.fotoPerfil,
          posicaoPrincipal: profile.posicaoPrincipal || prev.posicaoPrincipal,
          posicaoSecundaria: profile.posicaoSecundaria ?? '',
          peDominante: profile.peDominante || prev.peDominante,
          modalidadePreferida: profile.modalidadePreferida || prev.modalidadePreferida,
        }));
      })
      .catch(() => {
        // Mantém os dados em cache se a leitura inicial falhar
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  /* ── Foto de perfil ──────────────────────────────────────────────────── */
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      setPhotoError(validationError);
      e.target.value = '';
      return;
    }

    setPhotoError('');
    setServerError('');
    setSelectedFile(file);

    const localUrl = URL.createObjectURL(file);
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return localUrl;
    });
    setForm((prev) => ({ ...prev, fotoPerfil: localUrl }));
  };

  /* ── Posições disponíveis dependem da modalidade ─────────────────────── */
  const posicoes =
    form.modalidadePreferida === 'society' ? POSICOES_SOCIETY : POSICOES_FUTSAL;

  /* ── Validação ───────────────────────────────────────────────────────── */
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.nome.trim() || form.nome.trim().length < 2)
      e.nome = 'Nome deve ter pelo menos 2 caracteres';
    if (!form.posicaoPrincipal)
      e.posicaoPrincipal = 'Selecione a posição principal';
    if (!form.peDominante)
      e.peDominante = 'Selecione o pé dominante';
    return e;
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await saveUserProfile(
        {
          nome: form.nome.trim(),
          telefone: form.telefone.trim(),
          posicaoPrincipal: form.posicaoPrincipal,
          posicaoSecundaria: form.posicaoSecundaria,
          peDominante: form.peDominante,
          modalidadePreferida: form.modalidadePreferida,
        },
        selectedFile,
      );
      navigate('perfil');
    } catch (err) {
      setServerError(
        err instanceof ProfileServiceError
          ? err.message
          : 'Não foi possível salvar as alterações. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="w-full flex items-center px-4"
        style={{
          backgroundColor: '#000F1E',
          borderBottom: '1px solid #40493D',
          height: 56,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('perfil')}
          disabled={saving}
          className="flex items-center gap-2 text-[#BFCABA] hover:text-white transition-colors text-[14px] font-medium disabled:opacity-50"
          aria-label="Voltar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>
        <h1
          className="flex-1 text-center text-white font-semibold text-[16px]"
          style={{ marginRight: 52 }}
        >
          Editar perfil
        </h1>
      </header>

      {/* ── Formulário ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col items-center px-6 pt-6 pb-10 gap-5"
        >
          {/* Foto de perfil circular */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={saving}
              className="relative rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-60"
              style={{ width: 100, height: 100, backgroundColor: '#1A3A5C' }}
              aria-label="Alterar foto de perfil"
            >
              {form.fotoPerfil ? (
                <img
                  src={form.fotoPerfil}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}

              {/* Overlay de câmera */}
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
                style={{ height: 32, backgroundColor: 'rgba(0,15,30,0.7)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9FB7D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>

            <span className="text-[#9FB7D6] text-[12px]">
              Alterar foto (JPG, PNG ou WebP · máx. 2 MB)
            </span>

            {photoError && (
              <span className="text-red-400 text-[12px] font-medium text-center">
                {photoError}
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Divisor */}
          <div className="w-full" style={{ height: 1, backgroundColor: '#40493D' }} />

          {/* Nome */}
          <div className="w-full" style={{ maxWidth: 327 }}>
            <InputField
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, nome: e.target.value }));
                setErrors((prev) => ({ ...prev, nome: undefined }));
              }}
              error={errors.nome}
              maxLength={60}
            />
          </div>

          {/* Telefone */}
          <div className="w-full" style={{ maxWidth: 327 }}>
            <InputField
              label="Telefone (opcional)"
              type="tel"
              placeholder="(84) 99999-9999"
              value={form.telefone}
              onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))}
              maxLength={20}
            />
          </div>

          {/* Modalidade preferida */}
          <div className="w-full" style={{ maxWidth: 327 }}>
            <RadioGroup
              label="Modalidade preferida"
              options={OPCOES_MODALIDADE}
              value={form.modalidadePreferida}
              onChange={(val) =>
                setForm((prev) => ({
                  ...prev,
                  modalidadePreferida: val as Modalidade,
                  // Reseta as posições se a modalidade mudar
                  posicaoPrincipal: '',
                  posicaoSecundaria: '',
                }))
              }
            />
          </div>

          {/* Posição principal */}
          <div className="w-full" style={{ maxWidth: 327 }}>
            <Dropdown
              label="Posição principal"
              options={posicoes}
              value={form.posicaoPrincipal}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, posicaoPrincipal: val as Posicao }));
                setErrors((prev) => ({ ...prev, posicaoPrincipal: undefined }));
              }}
            />
            {errors.posicaoPrincipal && (
              <span className="text-red-500 text-[12px] font-medium mt-1 block">
                {errors.posicaoPrincipal}
              </span>
            )}
          </div>

          {/* Posição secundária (opcional) */}
          <div className="w-full" style={{ maxWidth: 327 }}>
            <Dropdown
              label="Posição secundária (opcional)"
              options={[{ label: 'Nenhuma', value: '' }, ...posicoes]}
              value={form.posicaoSecundaria}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, posicaoSecundaria: val as Posicao | '' }))
              }
            />
          </div>

          {/* Pé dominante */}
          <div className="w-full" style={{ maxWidth: 327 }}>
            <RadioGroup
              label="Pé dominante"
              options={OPCOES_PE}
              value={form.peDominante}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, peDominante: val as PeDominante }));
                setErrors((prev) => ({ ...prev, peDominante: undefined }));
              }}
              error={errors.peDominante}
            />
          </div>

          {/* Erro do servidor + Botão salvar */}
          <div className="w-full flex flex-col items-center gap-3 mt-2" style={{ maxWidth: 327 }}>
            {serverError && (
              <p className="text-red-400 text-[13px] font-medium text-center">{serverError}</p>
            )}
            <Button type="submit" disabled={saving} style={{ width: 196, borderRadius: 8 }}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
