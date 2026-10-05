import { useEffect, useState } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getAuthTokens, getSessionUser, logAuthTokens } from '../services/auth';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

/**
 * Mantém o estado de autenticação sincronizado com o Cognito:
 *  - verifica a sessão salva ao abrir o app (sobrevive a F5);
 *  - reage a login, logout e falha de renovação do token;
 *  - expõe e imprime os tokens JWT no console do navegador para inspeção (F12).
 */
export function useAuthSession(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let active = true;

    // Registra comandos globais no console do navegador (F12)
    if (typeof window !== 'undefined') {
      const win = window as unknown as Record<string, unknown>;
      win.getAuthTokens = getAuthTokens;
      win.logAuthTokens = logAuthTokens;
    }

    const refresh = async () => {
      const user = await getSessionUser();
      if (active) {
        setStatus(user ? 'authenticated' : 'unauthenticated');
        if (user) {
          // Imprime os tokens JWT no console assim que a sessão for detectada
          void logAuthTokens();
        }
      }
    };

    void refresh();

    const stopListening = Hub.listen('auth', ({ payload }) => {
      if (
        payload.event === 'signedIn' ||
        payload.event === 'signedOut' ||
        payload.event === 'tokenRefresh_failure'
      ) {
        void refresh();
      }
    });

    return () => {
      active = false;
      stopListening();
    };
  }, []);

  return status;
}
