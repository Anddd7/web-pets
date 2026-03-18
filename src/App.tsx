import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import PetSelection from './pages/PetSelection';
import TasksPage from './pages/TasksPage';
import ShopPage from './pages/ShopPage';
import SettingsPage from './pages/SettingsPage';
import { PetProvider } from './contexts/PetContext';
import { TaskProvider } from './contexts/TaskContext';
import { ShopProvider } from './contexts/ShopContext';

const normalizePath = (path: string): string => {
  const normalized = path.replace(/\/+$/, '');
  return normalized || '/';
};

const AppContent: React.FC = () => {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  switch (path) {
    case '/select':
      return <PetSelection />;
    case '/tasks':
      return <TasksPage />;
    case '/shop':
      return <ShopPage />;
    case '/settings':
      return <SettingsPage />;
    default:
      return <Home />;
  }
};

const App: React.FC = () => {
  return (
    <TaskProvider>
      <PetProvider>
        <ShopProvider>
          <AppContent />
        </ShopProvider>
      </PetProvider>
    </TaskProvider>
  );
};

export default App;
