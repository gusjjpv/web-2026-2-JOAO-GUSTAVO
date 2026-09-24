import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Dropdown } from '../../components/ui/Dropdown';
import logoImg from '../../assets/Logo.svg';
import type { Route } from '../../App';

interface PlayerInfoPageProps {
  navigate: (route: Route) => void;
}

const POSICOES = [
  { label: 'Fixo', value: 'fixo' },
  { label: 'Ala', value: 'ala' },
  { label: 'Pivo', value: 'pivo' },
  { label: 'Goleiro', value: 'goleiro' },
];

const PES = [
  { label: 'Destro', value: 'destro' },
  { label: 'Canhoto', value: 'canhoto' },
  { label: 'Ambidestro', value: 'ambidestro' },
];

const MODALIDADES = [
  { label: 'Futsal', value: 'futsal' },
  { label: 'Futset', value: 'futset' },
];

/**
 * Página de Cadastro — Informações do jogador — RachaoApp
 * Figma node: 20-562
 *
 * Dropdowns: posição principal, secundária, pé dominante, modalidade preferida
 * Botão: "Continuar →" → navega para upload-photo
 */
export function PlayerInfoPage({ navigate }: PlayerInfoPageProps) {
  const [form, setForm] = useState({
    posicaoPrincipal: '',
    posicaoSecundaria: '',
    peDominante: '',
    modalidade: '',
  });

  const handleChange = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: integrar com serviço de cadastro
    navigate('upload-photo');
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

        <div className="flex justify-center mt-6">
          <Button type="submit" style={{ width: 143, borderRadius: 8 }}>
            Continuar →
          </Button>
        </div>
      </form>
    </div>
  );
}
