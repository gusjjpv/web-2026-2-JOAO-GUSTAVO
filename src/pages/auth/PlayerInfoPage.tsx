import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Dropdown } from '../../components/ui/Dropdown';
import { ProfileServiceError, saveUserProfile } from '../../services/profile';
import logoImg from '../../assets/Logo.svg';
import type { Route } from '../../App';

interface PlayerInfoPageProps {
  navigate: (route: Route) => void;
}

const POSICOES = [
  { label: 'Goleiro', value: 'Goleiro' },
  { label: 'Fixo', value: 'Fixo' },
  { label: 'Ala', value: 'Ala' },
  { label: 'Pivô', value: 'Pivô' },
  { label: 'Versátil', value: 'Versátil' },
];

const PES = [
  { label: 'Destro', value: 'Destro' },
  { label: 'Canhoto', value: 'Canhoto' },
  { label: 'Ambidestro', value: 'Ambidestro' },
];

const MODALIDADES = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Society', value: 'society' },
];

/**
 * Página de Cadastro — Informações do jogador — RachaoApp
 * Figma node: 20-562
 *
 * Dropdowns: posição principal, secundária, pé dominante, modalidade preferida
 * Botão: "Continuar →" → salva no DynamoDB (PUT /profile) e navega para upload-photo
 */
export function PlayerInfoPage({ navigate }: PlayerInfoPageProps) {
  const [form, setForm] = useState({
    posicaoPrincipal: '',
    posicaoSecundaria: '',
    peDominante: '',
    modalidade: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await saveUserProfile({
        posicaoPrincipal: form.posicaoPrincipal,
        posicaoSecundaria: form.posicaoSecundaria,
        peDominante: form.peDominante,
        modalidadePreferida: form.modalidade,
      });
      navigate('upload-photo');
    } catch (err) {
      setError(
        err instanceof ProfileServiceError
          ? err.message
          : 'Não foi possível salvar seus dados. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start px-6 pb-10"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center" style={{ marginTop: 80, marginBottom: 60 }}>
        <img
          src={logoImg}
          alt="RachaoApp mascote"
          className="w-[211px] h-[211px] object-contain"
        />
        <span
          style={{
            fontFamily: "'Unbounded', sans-serif",
            fontWeight: 800,
            fontSize: 40,
            lineHeight: '56px',
            letterSpacing: '-0.03em',
            color: '#009951',
          }}
        >
          RachaoApp
        </span>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-[14px] w-full"
        style={{ maxWidth: 327 }}
        noValidate
      >
        <Dropdown
          label="posição principal"
          options={POSICOES}
          value={form.posicaoPrincipal}
          onChange={handleChange('posicaoPrincipal')}
        />

        <Dropdown
          label="posição secundaria"
          options={POSICOES}
          value={form.posicaoSecundaria}
          onChange={handleChange('posicaoSecundaria')}
        />

        <Dropdown
          label="Pé dominante"
          options={PES}
          value={form.peDominante}
          onChange={handleChange('peDominante')}
        />

        <Dropdown
          label="modalidade preferida"
          options={MODALIDADES}
          value={form.modalidade}
          onChange={handleChange('modalidade')}
        />

        {error && (
          <p className="text-red-400 text-[13px] font-medium text-center mt-2">{error}</p>
        )}

        <div className="flex justify-center mt-6">
          <Button type="submit" disabled={saving} style={{ width: 156, borderRadius: 8 }}>
            {saving ? 'Salvando...' : 'Continuar →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
