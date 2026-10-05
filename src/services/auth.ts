import {
  autoSignIn,
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { isCognitoConfigured, isOAuthConfigured } from '../lib/amplify';
import { normalizePhoneBR } from '../lib/phone';

/* ── Tipos ─────────────────────────────────────────────────────────────── */

/** Estado passado de uma tela para a ConfirmCodePage via navigate(). */
export interface ConfirmCodeNavState {
  username: string;
  /** Destino do código já mascarado pelo Cognito (ex: j***@g***.com). */
  destination?: string;
  /** Se true, reenvia um código novo ao abrir a tela (usuário veio do login). */
  resendOnOpen?: boolean;
}

export type LoginResult = 'SIGNED_IN' | 'CONFIRM_SIGN_UP';

export interface RegisterInput {
  username: string;
  password: string;
  email: string;
  nome: string;
  /** Telefone em formato livre; opcional. */
  telefone?: string;
}

export interface RegisterResult {
  nextStep: 'CONFIRM_SIGN_UP' | 'LOGIN';
  destination?: string;
}

/** Erro já traduzido para exibição direta na interface. */
export class AuthServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
  }
}

/* ── Tradução de erros do Cognito ──────────────────────────────────────── */

function passwordPolicyMessage(message: string): string {
  const m = message.toLowerCase();
  const missing: string[] = [];
  if (m.includes('uppercase')) missing.push('uma letra maiúscula');
  if (m.includes('lowercase')) missing.push('uma letra minúscula');
  if (m.includes('numeric')) missing.push('um número');
  if (m.includes('symbol') || m.includes('special')) missing.push('um caractere especial');
  if (m.includes('not long enough') || m.includes('length')) {
    missing.push('o tamanho mínimo exigido');
  }
  return missing.length > 0
    ? `A senha precisa ter ${missing.join(', ')}.`
    : 'A senha não atende aos requisitos de segurança.';
}

function toServiceError(error: unknown): AuthServiceError {
  if (error instanceof AuthServiceError) return error;

  const name = error instanceof Error ? error.name : 'UnknownError';
  const message = error instanceof Error ? error.message : '';

  switch (name) {
    case 'NotAuthorizedException':
    case 'UserNotFoundException':
      return new AuthServiceError(name, 'Usuário ou senha incorretos.');
    case 'UserNotConfirmedException':
      return new AuthServiceError(name, 'Confirme seu e-mail para continuar.');
    case 'UsernameExistsException':
      return new AuthServiceError(
        name,
        'Este nome de usuário já está em uso. Se você já iniciou o cadastro, faça login para confirmar seu e-mail.',
      );
    case 'InvalidPasswordException':
      return new AuthServiceError(name, passwordPolicyMessage(message));
    case 'InvalidParameterException':
      return new AuthServiceError(
        name,
        message.toLowerCase().includes('password')
          ? passwordPolicyMessage(message)
          : 'Dados inválidos. Verifique os campos e tente novamente.',
      );
    case 'CodeMismatchException':
      return new AuthServiceError(name, 'Código incorreto. Confira o e-mail e tente de novo.');
    case 'ExpiredCodeException':
      return new AuthServiceError(name, 'Código expirado. Solicite um novo código.');
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      return new AuthServiceError(name, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
    case 'NetworkError':
      return new AuthServiceError(name, 'Sem conexão. Verifique sua internet e tente novamente.');
    default:
      return new AuthServiceError(name, 'Não foi possível concluir a operação. Tente novamente.');
  }
}

function assertConfigured(): void {
  if (!isCognitoConfigured) {
    throw new AuthServiceError(
      'NOT_CONFIGURED',
      'Autenticação não configurada. Preencha VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID no .env.local.',
    );
  }
}

/* ── Operações ─────────────────────────────────────────────────────────── */

/**
 * Login por username + senha.
 * Se o usuário ainda não confirmou o e-mail, retorna 'CONFIRM_SIGN_UP'
 * para a tela encaminhá-lo à confirmação de código.
 */
export async function login(username: string, password: string): Promise<LoginResult> {
  assertConfigured();

  const attempt = () => signIn({ username: username.trim(), password });

  try {
    let output;
    try {
      output = await attempt();
    } catch (error) {
      // Já existe uma sessão ativa (ex: outro usuário): encerra e tenta de novo.
      if (error instanceof Error && error.name === 'UserAlreadyAuthenticatedException') {
        await signOut();
        output = await attempt();
      } else {
        throw error;
      }
    }

    if (output.isSignedIn) return 'SIGNED_IN';

    const step = output.nextStep.signInStep;
    if (step === 'CONFIRM_SIGN_UP') return 'CONFIRM_SIGN_UP';

    throw new AuthServiceError(
      'UNSUPPORTED_STEP',
      'Esta conta exige uma etapa adicional que ainda não é suportada.',
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'UserNotConfirmedException') {
      return 'CONFIRM_SIGN_UP';
    }
    throw toServiceError(error);
  }
}

/**
 * Cadastro. O username é o identificador de login; o e-mail é atributo
 * obrigatório usado para enviar o código de verificação.
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  assertConfigured();

  const userAttributes: Record<string, string> = {
    email: input.email.trim(),
    name: input.nome.trim(),
  };

  if (input.telefone?.trim()) {
    const phone = normalizePhoneBR(input.telefone);
    if (!phone) {
      throw new AuthServiceError('INVALID_PHONE', 'Telefone inválido. Use DDD + número.');
    }
    userAttributes.phone_number = phone;
  }

  try {
    const output = await signUp({
      username: input.username.trim(),
      password: input.password,
      options: {
        userAttributes,
        // Permite logar automaticamente logo após confirmar o código.
        autoSignIn: true,
      },
    });

    if (output.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      return {
        nextStep: 'CONFIRM_SIGN_UP',
        destination: output.nextStep.codeDeliveryDetails?.destination,
      };
    }
    return { nextStep: 'LOGIN' };
  } catch (error) {
    throw toServiceError(error);
  }
}

/**
 * Confirma o e-mail com o código recebido.
 * Retorna `true` se o login automático foi concluído (sessão criada).
 */
export async function confirmRegistration(username: string, code: string): Promise<boolean> {
  assertConfigured();

  try {
    const output = await confirmSignUp({
      username: username.trim(),
      confirmationCode: code.trim(),
    });

    if (output.nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
      try {
        const signedIn = await autoSignIn();
        return signedIn.isSignedIn;
      } catch {
        // autoSignIn só funciona na mesma sessão do navegador do cadastro;
        // em outros casos o usuário simplesmente faz login.
        return false;
      }
    }
    return false;
  } catch (error) {
    throw toServiceError(error);
  }
}

/** Reenvia o código de confirmação. Retorna o destino mascarado, se houver. */
export async function resendConfirmationCode(username: string): Promise<string | undefined> {
  assertConfigured();

  try {
    const output = await resendSignUpCode({ username: username.trim() });
    return output.destination;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function logout(): Promise<void> {
  assertConfigured();

  try {
    await signOut();
  } catch (error) {
    throw toServiceError(error);
  }
}

/**
 * Solicita redefinição de senha para o usuário.
 * O Cognito envia um código de 6 dígitos para o e-mail cadastrado.
 * Retorna o destino mascarado (ex: j***@g***.com).
 */
export async function requestPasswordReset(username: string): Promise<string | undefined> {
  assertConfigured();

  try {
    const output = await resetPassword({ username: username.trim() });
    return output.nextStep.codeDeliveryDetails?.destination;
  } catch (error) {
    throw toServiceError(error);
  }
}

/**
 * Confirma a redefinição de senha informando o código e a nova senha.
 */
export async function confirmNewPassword(
  username: string,
  code: string,
  newPassword: string,
): Promise<void> {
  assertConfigured();

  try {
    await confirmResetPassword({
      username: username.trim(),
      confirmationCode: code.trim(),
      newPassword,
    });
  } catch (error) {
    throw toServiceError(error);
  }
}

/**
 * Inicia o fluxo de autenticação OAuth 2.0 com o Google.
 * Redireciona o navegador para a tela de consentimento do Google e de volta ao app.
 */
export async function loginWithGoogle(): Promise<void> {
  assertConfigured();

  if (!isOAuthConfigured) {
    throw new AuthServiceError(
      'OAUTH_NOT_CONFIGURED',
      'Domínio do Cognito não configurado. Defina VITE_COGNITO_DOMAIN no .env.local.',
    );
  }

  try {
    await signInWithRedirect({ provider: 'Google' });
  } catch (error) {
    throw toServiceError(error);
  }
}

/** Usuário da sessão atual, ou null se não houver sessão válida. */
export async function getSessionUser(): Promise<{ username: string; userId: string } | null> {
  if (!isCognitoConfigured) return null;

  try {
    const { username, userId } = await getCurrentUser();
    return { username, userId };
  } catch {
    return null;
  }
}

export interface AuthTokens {
  idToken?: string;
  accessToken?: string;
  idTokenPayload?: Record<string, unknown>;
  accessTokenPayload?: Record<string, unknown>;
}

/**
 * Obtém os tokens JWT da sessão atual (ID Token e Access Token).
 */
export async function getAuthTokens(): Promise<AuthTokens | null> {
  if (!isCognitoConfigured) return null;

  try {
    const session = await fetchAuthSession();
    if (!session.tokens) return null;

    return {
      idToken: session.tokens.idToken?.toString(),
      accessToken: session.tokens.accessToken?.toString(),
      idTokenPayload: session.tokens.idToken?.payload as Record<string, unknown>,
      accessTokenPayload: session.tokens.accessToken?.payload as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}
