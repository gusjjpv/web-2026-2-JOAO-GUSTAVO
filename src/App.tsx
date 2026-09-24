import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PlayerInfoPage } from './pages/auth/PlayerInfoPage';
import { UploadPhotoPage } from './pages/auth/UploadPhotoPage';
import { HomePage } from './pages/home/HomePage';

export type Route =
  | 'login'
  | 'register'
  | 'player-info'
  | 'upload-photo'
  | 'home';

function App() {
  const [route, setRoute] = useState<Route>('login');

  const navigate = (r: Route) => setRoute(r);

  const screens: Record<Route, React.ReactNode> = {
    login: <LoginPage navigate={navigate} />,
    register: <RegisterPage navigate={navigate} />,
    'player-info': <PlayerInfoPage navigate={navigate} />,
    'upload-photo': <UploadPhotoPage navigate={navigate} />,
    home: <HomePage navigate={navigate} />,
  };

  return <>{screens[route]}</>;
}

export default App;
