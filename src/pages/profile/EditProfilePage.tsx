import { useState, useRef, type FormEvent } from 'react';
import { InputField } from '../../components/ui/InputField';
import { Dropdown } from '../../components/ui/Dropdown';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { Button } from '../../components/ui/Button';
import {
  getCurrentProfile,
  updateProfile,
  type Posicao,
  type PeDominante,
  type Modalidade,
} from '../../mock/userData';
import type { Route } from '../../App';

interface EditProfilePageProps {
  navigate: (route: Route, state?: unknown) => void;
}

interface EditForm {
  nome: string;
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
 * Campos editáveis:
 *  - Foto de perfil (circular, clicável)
 *  - Nome completo
 *  - Posição principal (Dropdown — depende da modalidade)
 *  - Posição secundária (Dropdown — opcional)
 *  - Pé dominante (RadioGroup)
 *  - Modalidade preferida (RadioGroup)
 */
export function EditProfilePage({ navigate }: EditProfilePageProps) {
  // Inicializa o form com os dados atuais do store
  const currentProfile = getCurrentProfile();
  const [form, setForm] = useState<EditForm>({
    nome: currentProfile.nome,
    fotoPerfil: currentProfile.fotoPerfil,
    posicaoPrincipal: currentProfile.posicaoPrincipal,
    posicaoSecundaria: currentProfile.posicaoSecundaria ?? '',
    peDominante: currentProfile.peDominante,
    modalidadePreferida: currentProfile.modalidadePreferida,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Foto de perfil ──────────────────────────────────────────────────── */
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((prev) => ({ ...prev, fotoPerfil: ev.target?.result as string }));
    reader.readAsDataURL(file);
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
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Persiste no store em memória — será substituído por PATCH /perfil (API)
    updateProfile({
      nome: form.nome.trim(),
      fotoPerfil: form.fotoPerfil,
      posicaoPrincipal: form.posicaoPrincipal as Posicao,
      posicaoSecundaria: form.posicaoSecundaria ? form.posicaoSecundaria as Posicao : null,
      peDominante: form.peDominante as PeDominante,
      modalidadePreferida: form.modalidadePreferida,
    });

    navigate('perfil');
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
          className="flex items-center gap-2 text-[#BFCABA] hover:text-white transition-colors text-[14px] font-medium"
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
              className="relative rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
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

            <span className="text-[#6C7278] text-[12px]">Alterar foto</span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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

          {/* Botão salvar */}
          <div className="w-full flex justify-center mt-2" style={{ maxWidth: 327 }}>
            <Button type="submit" style={{ width: 180, borderRadius: 8 }}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
