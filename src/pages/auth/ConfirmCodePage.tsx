import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import {
  AuthServiceError,
  confirmRegistration,
  resendConfirmationCode,
  type ConfirmCodeNavState,
} from '../../services/auth';
import logoImg from '../../assets/Logo.svg';
import type { Route } from '../../App';

interface ConfirmCodePageProps {
  navigate: (route: Route, state?: unknown) => void;
  state: ConfirmCodeNavState;
}

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Página de confirmação de e-mail — RachaoApp
 * (sem node no Figma — segue o design system das telas de autenticação)
 *
 * O Cognito envia um código de 6 dígitos ao e-mail informado no cadastro.
 * Ao confirmar, o usuário é logado automaticamente e segue o onboarding.
 */
export function ConfirmCodePage({ navigate, state }: ConfirmCodePageProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState(state.destination);
  const [cooldown, setCooldown] = useState(0);
  const resentOnOpen = useRef(false);

  const startCooldown = () => setCooldown(RESEND_COOLDOWN_SECONDS);

  const sendCode = async () => {
    setError('');
    setInfo('');
    try {
      const dest = await resendConfirmationCode(state.username);
      if (dest) setDestination(dest);
      setInfo('Enviamos um novo código para o seu e-mail.');
      startCooldown();
    } catch (err) {
      setError(err instanceof AuthServiceError ? err.message : 'Não foi possível reenviar o código.');
    }
  };

  // Veio do login (conta não confirmada): envia um código novo uma única vez.
  useEffect(() => {
    if (state.resendOnOpen && !resentOnOpen.current) {
      resentOnOpen.current = true;
      void sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contagem regressiva do botão "Reenviar".
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Digite o código de 6 dígitos enviado ao seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      const signedIn = await confirmRegistration(state.username, code);
      if (signedIn) {
        navigate('player-info');
      } else {
        navigate('login', { notice: 'E-mail confirmado! Faça login para continuar.' });
      }
    } catch (err) {
      setError(err instanceof AuthServiceError ? err.message : 'Não foi possível confirmar o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start px-6 pb-10"
      style={{ backgroundColor: '#102A43' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center" style={{ marginTop: 80, marginBottom: 40 }}>
        <img src={logoImg} alt="RachaoApp mascote" className="w-[160px] h-[160px] object-contain" />
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

      <h1 className="text-white font-semibold text-[18px] text-center">Confirme seu e-mail</h1>
      <p className="text-[#9FB7D6] text-[13px] text-center mt-2 mb-6" style={{ maxWidth: 300 }}>
        Enviamos um código de 6 dígitos para{' '}
        <strong className="text-white">{destination ?? 'o seu e-mail'}</strong>.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full"
        style={{ maxWidth: 327 }}
        noValidate
      >
        <InputField
          label="Código de verificação"
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
        />

        {error && (
          <span className="text-red-400 text-[12px] font-medium mt-3 text-center" role="alert">
            {error}
          </span>
        )}
        {info && !error && (
          <span className="text-[#88D982] text-[12px] font-medium mt-3 text-center">{info}</span>
        )}

        <div className="flex justify-center mt-8">
          <Button type="submit" disabled={loading} style={{ width: 173 }}>
            {loading ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </div>
      </form>

      <div className="flex flex-col items-center gap-3 mt-8 text-[14px] font-semibold">
        <button
          type="button"
          onClick={() => void sendCode()}
          disabled={cooldown > 0}
          className="underline text-[#0978F5] hover:opacity-80 transition-opacity disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
        </button>
        <button
          type="button"
          onClick={() => navigate('login')}
          className="text-white hover:opacity-80 transition-opacity"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}
