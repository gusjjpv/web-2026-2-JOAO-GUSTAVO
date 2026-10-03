import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ConfirmCodePage } from './pages/auth/ConfirmCodePage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { PlayerInfoPage } from './pages/auth/PlayerInfoPage';
import { UploadPhotoPage } from './pages/auth/UploadPhotoPage';
import { HomePage } from './pages/home/HomePage';
import { CreateGroupPage } from './pages/group/CreateGroupPage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { CreateRachaPage } from './pages/racha/CreateRachaPage';
import { useAuthSession } from './hooks/useAuthSession';
import type { ConfirmCodeNavState } from './services/auth';

export type Route =
  | 'login'
  | 'register'
  | 'confirm-code'
  | 'esqueci-senha'
  | 'player-info'
  | 'upload-photo'
  | 'home'
  | 'criar-grupo'
  | 'detalhe-grupo'
  | 'criar-racha'
  | 'perfil'
  | 'editar-perfil';

/** Telas acessíveis sem sessão. Todas as outras exigem usuário autenticado. */
const PUBLIC_ROUTES: Route[] = ['login', 'register', 'confirm-code', 'esqueci-senha'];

function isConfirmCodeState(value: unknown): value is ConfirmCodeNavState {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ConfirmCodeNavState).username === 'string'
  );
}

function App() {
  const [route, setRoute] = useState<Route>('login');
  // Estado passado entre telas (ex: dados do grupo recém-criado)
  const [routeState, setRouteState] = useState<unknown>(null);
  const authStatus = useAuthSession();

  const navigate = (r: Route, state: unknown = null) => {
    setRouteState(state);
    setRoute(r);
  };

  // Enquanto verifica se existe uma sessão salva, não mostra nenhuma tela
  // (evita piscar o login para quem já está autenticado).
  if (authStatus === 'checking') {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: '#102A43' }}
      >
        <span className="text-[#9FB7D6] text-[14px]">Carregando...</span>
      </div>
    );
  }

  // Proteção de rotas: a tela efetiva é derivada da sessão.
  let current: Route = route;
  if (authStatus === 'unauthenticated' && !PUBLIC_ROUTES.includes(current)) current = 'login';
  if (authStatus === 'authenticated' && current === 'login') current = 'home';
  if (current === 'confirm-code' && !isConfirmCodeState(routeState)) current = 'login';

  // Renderização condicional garante que apenas UM componente é montado por vez,
  // evitando conflitos de hooks entre telas diferentes.
  return (
    <>
      {current === 'login' && (
        <LoginPage
          navigate={navigate}
          notice={(routeState as { notice?: string } | null)?.notice}
        />
      )}
      {current === 'register' && <RegisterPage navigate={navigate} />}
      {current === 'esqueci-senha' && <ForgotPasswordPage navigate={navigate} />}
      {current === 'confirm-code' && isConfirmCodeState(routeState) && (
        <ConfirmCodePage navigate={navigate} state={routeState} />
      )}
      {current === 'player-info' && <PlayerInfoPage navigate={navigate} />}
      {current === 'upload-photo' && <UploadPhotoPage navigate={navigate} />}
      {current === 'home' && <HomePage navigate={navigate} />}
      {current === 'criar-grupo' && <CreateGroupPage navigate={navigate} />}
      {current === 'detalhe-grupo' && (
        <GroupDetailPage
          navigate={navigate}
          groupData={routeState as Parameters<typeof GroupDetailPage>[0]['groupData']}
        />
      )}
      {current === 'criar-racha' && (
        <CreateRachaPage
          navigate={navigate}
          groupData={routeState as Parameters<typeof CreateRachaPage>[0]['groupData']}
        />
      )}
      {current === 'perfil' && <ProfilePage navigate={navigate} />}
      {current === 'editar-perfil' && <EditProfilePage navigate={navigate} />}
    </>
  );
}

export default App;
