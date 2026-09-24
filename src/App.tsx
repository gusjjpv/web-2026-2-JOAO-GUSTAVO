import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PlayerInfoPage } from './pages/auth/PlayerInfoPage';
import { UploadPhotoPage } from './pages/auth/UploadPhotoPage';
import { HomePage } from './pages/home/HomePage';
import { CreateGroupPage } from './pages/group/CreateGroupPage';
import { GroupDetailPage } from './pages/group/GroupDetailPage';

export type Route =
  | 'login'
  | 'register'
  | 'player-info'
  | 'upload-photo'
  | 'home'
  | 'criar-grupo'
  | 'detalhe-grupo';

function App() {
  const [route, setRoute] = useState<Route>('login');
  // Estado passado entre telas (ex: dados do grupo recém-criado)
  const [routeState, setRouteState] = useState<unknown>(null);

  const navigate = (r: Route, state: unknown = null) => {
    setRouteState(state);
    setRoute(r);
  };

  const screens: Record<Route, React.ReactNode> = {
    login: <LoginPage navigate={navigate} />,
    register: <RegisterPage navigate={navigate} />,
    'player-info': <PlayerInfoPage navigate={navigate} />,
    'upload-photo': <UploadPhotoPage navigate={navigate} />,
    home: <HomePage navigate={navigate} />,
    'criar-grupo': <CreateGroupPage navigate={navigate} />,
    'detalhe-grupo': (
      <GroupDetailPage
        navigate={navigate}
        groupData={routeState as Parameters<typeof GroupDetailPage>[0]['groupData']}
      />
    ),
  };

  return <>{screens[route]}</>;
}

export default App;
