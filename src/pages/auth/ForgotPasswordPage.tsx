import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import {
  AuthServiceError,
  confirmNewPassword,
  requestPasswordReset,
} from '../../services/auth';
import logoImg from '../../assets/Logo.svg';
import type { Route } from '../../App';

interface ForgotPasswordPageProps {
  navigate: (route: Route, state?: unknown) => void;
}

type Step = 'REQUEST' | 'CONFIRM';

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Página de Recuperação de Senha — RachaoApp
 *
 * Etapa 1: Usuário informa seu username para receber o código no e-mail.
 * Etapa 2: Usuário informa o código de 6 dígitos e a nova senha.
 */
export function ForgotPasswordPage({ navigate }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>('REQUEST');
  const [username, setUsername] = useState('');
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Timer para contagem regressiva do reenvio
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRequestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!username.trim()) {
      setError('Informe seu nome de usuário.');
      return;
    }

    setLoading(true);
    try {
      const dest = await requestPasswordReset(username);
      setDestination(dest ?? 'seu e-mail');
      setStep('CONFIRM');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setInfo('Código enviado com sucesso!');
    } catch (err) {
      setError(
        err instanceof AuthServiceError
          ? err.message
          : 'Não foi possível solicitar a redefinição de senha.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setInfo('');
    try {
      const dest = await requestPasswordReset(username);
      if (dest) setDestination(dest);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setInfo('Novo código enviado para o seu e-mail!');
    } catch (err) {
      setError(
        err instanceof AuthServiceError
          ? err.message
          : 'Não foi possível reenviar o código.',
      );
    }
  };

  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Digite o código de 6 dígitos enviado por e-mail.');
      return;
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await confirmNewPassword(username, code, newPassword);
      navigate('login', {
        notice: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
      });
    } catch (err) {
      setError(
        err instanceof AuthServiceError
          ? err.message
          : 'Não foi possível redefinir a senha.',
      );
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
      <div className="flex flex-col items-center" style={{ marginTop: 70, marginBottom: 32 }}>
        <img
          src={logoImg}
          alt="RachaoApp mascote"
          className="w-[160px] h-[160px] object-contain"
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

      {step === 'REQUEST' ? (
        <>
          <h1 className="text-white font-semibold text-[18px] text-center">
            Recuperação de conta
          </h1>
          <p className="text-[#9FB7D6] text-[13px] text-center mt-2 mb-6" style={{ maxWidth: 300 }}>
            Informe seu usuário para receber um código de redefinição no e-mail cadastrado.
          </p>

          <form
            onSubmit={handleRequestSubmit}
            className="flex flex-col w-full"
            style={{ maxWidth: 327 }}
            noValidate
          >
            <InputField
              label="Usuário"
              type="text"
              placeholder="seu_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            {error && (
              <span className="text-red-400 text-[12px] font-medium mt-3 text-center" role="alert">
                {error}
              </span>
            )}

            <div className="flex justify-center mt-6">
              <Button type="submit" disabled={loading} style={{ width: 173 }}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-white font-semibold text-[18px] text-center">
            Redefinir senha
          </h1>
          <p className="text-[#9FB7D6] text-[13px] text-center mt-2 mb-6" style={{ maxWidth: 320 }}>
            Enviamos um código de 6 dígitos para{' '}
            <strong className="text-white">{destination}</strong>.
          </p>

          <form
            onSubmit={handleConfirmSubmit}
            className="flex flex-col gap-4 w-full"
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

            <InputField
              label="Nova senha"
              type="password"
              placeholder="Min. 8 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />

            <InputField
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            {error && (
              <span className="text-red-400 text-[12px] font-medium text-center" role="alert">
                {error}
              </span>
            )}
            {info && !error && (
              <span className="text-[#88D982] text-[12px] font-medium text-center">
                {info}
              </span>
            )}

            <div className="flex justify-center mt-2">
              <Button type="submit" disabled={loading} style={{ width: 190 }}>
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </div>
          </form>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={cooldown > 0}
              className="text-[13px] underline text-[#0978F5] hover:opacity-80 transition-opacity disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
            </button>
          </div>
        </>
      )}

      {/* Voltar ao login */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => navigate('login')}
          className="text-white text-[14px] font-semibold hover:opacity-80 transition-opacity"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}
