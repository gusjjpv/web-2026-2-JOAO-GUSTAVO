import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN as string | undefined;

/** true quando as variáveis básicas do Cognito estão preenchidas no .env.local */
export const isCognitoConfigured = Boolean(userPoolId && userPoolClientId);

/** true quando o domínio do Cognito para login social (Google, etc.) está configurado */
export const isOAuthConfigured = Boolean(isCognitoConfigured && cognitoDomain);

if (isCognitoConfigured) {
  // Garante que o domínio esteja sem protocolo ou barras finais
  const cleanDomain = cognitoDomain
    ?.replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  // Assegura trailing slash no origin para casar com "http://localhost:5173/"
  const currentOrigin = typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : 'http://localhost:5173/';

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
        loginWith: cleanDomain
          ? {
              oauth: {
                domain: cleanDomain,
                scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
                redirectSignIn: [currentOrigin],
                redirectSignOut: [currentOrigin],
                responseType: 'code',
              },
            }
          : undefined,
      },
    },
  });
} else {
  console.warn(
    '[auth] Cognito não configurado. Copie .env.example para .env.local e preencha ' +
      'VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID.',
  );
}
