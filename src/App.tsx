import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PlayerInfoPage } from './pages/auth/PlayerInfoPage';
import { UploadPhotoPage } from './pages/auth/UploadPhotoPage';
import { HomePage } from './pages/home/HomePage';
import { CreateGroupPage } from './pages/group/CreateGroupPage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { EditProfilePage } from './pages/profile/EditProfilePage';
import { CreateRachaPage } from './pages/racha/CreateRachaPage';

export type Route =
  | 'login'
  | 'register'
  | 'player-info'
  | 'upload-photo'
  | 'home'
  | 'criar-grupo'
  | 'detalhe-grupo'
  | 'criar-racha'
  | 'perfil'
  | 'editar-perfil';

function App() {
  const [route, setRoute] = useState<Route>('login');
  // Estado passado entre telas (ex: dados do grupo recém-criado)
  const [routeState, setRouteState] = useState<unknown>(null);

  const navigate = (r: Route, state: unknown = null) => {
    setRouteState(state);
    setRoute(r);
  };

  // Renderização condicional garante que apenas UM componente é montado por vez,
  // evitando conflitos de hooks entre telas diferentes.
  return (
    <>
      {route === 'login' && <LoginPage navigate={navigate} />}
      {route === 'register' && <RegisterPage navigate={navigate} />}
      {route === 'player-info' && <PlayerInfoPage navigate={navigate} />}
      {route === 'upload-photo' && <UploadPhotoPage navigate={navigate} />}
      {route === 'home' && <HomePage navigate={navigate} />}
      {route === 'criar-grupo' && <CreateGroupPage navigate={navigate} />}
      {route === 'detalhe-grupo' && (
        <GroupDetailPage
          navigate={navigate}
          groupData={routeState as Parameters<typeof GroupDetailPage>[0]['groupData']}
        />
      )}
      {route === 'criar-racha' && (
        <CreateRachaPage
          navigate={navigate}
          groupData={routeState as Parameters<typeof CreateRachaPage>[0]['groupData']}
        />
      )}
      {route === 'perfil' && <ProfilePage navigate={navigate} />}
      {route === 'editar-perfil' && <EditProfilePage navigate={navigate} />}
    </>
  );
}

export default App;
