import { useEffect, useState } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getSessionUser } from '../services/auth';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

/**
 * Mantém o estado de autenticação sincronizado com o Cognito:
 *  - verifica a sessão salva ao abrir o app (sobrevive a F5);
 *  - reage a login, logout e falha de renovação do token.
 */
export function useAuthSession(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const user = await getSessionUser();
      if (active) setStatus(user ? 'authenticated' : 'unauthenticated');
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
