import { useState } from 'react';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PlayerInfoPage } from './pages/auth/PlayerInfoPage';
import { UploadPhotoPage } from './pages/auth/UploadPhotoPage';
import { HomePage } from './pages/home/HomePage';

/**
 * Rotas disponíveis no app.
 * Quando react-router for adicionado, substituir este controle simples.
 */
type Route =
  | 'login'
  | 'register'
  | 'player-info'
  | 'upload-photo'
  | 'home';

function App() {
  const [route, setRoute] = useState<Route>('login');

  // Mapeamento simples de rota → componente
  const screens: Record<Route, React.ReactNode> = {
    login: <LoginPage />,
    register: <RegisterPage />,
    'player-info': <PlayerInfoPage />,
    'upload-photo': <UploadPhotoPage />,
    home: <HomePage />,
  };

  return (
    <>
      {screens[route]}

      {/* Navegação de dev — remover quando react-router for integrado */}
      {import.meta.env.DEV && (
        <nav
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: 8,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            borderRadius: '0 0 0 8px',
          }}
        >
          {(Object.keys(screens) as Route[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoute(r)}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                background: route === r ? '#C6FF00' : '#fff',
                color: '#102A43',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {r}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}

export default App;
