import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;

/** true quando as variáveis do Cognito estão preenchidas no .env.local */
export const isCognitoConfigured = Boolean(userPoolId && userPoolClientId);

if (isCognitoConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
      },
    },
  });
} else {
  console.warn(
    '[auth] Cognito não configurado. Copie .env.example para .env.local e preencha ' +
      'VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID.',
  );
}
