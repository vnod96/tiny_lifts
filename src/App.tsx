import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { LogPage } from './pages/LogPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="flex flex-col h-full bg-atlas-bg">
          <Routes>
            <Route path="/" element={<LogPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <BottomTabBar />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
