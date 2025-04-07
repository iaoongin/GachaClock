import { Route, Routes } from 'react-router-dom';

import IndexPage from '@/pages/index';
import HistoryPage from './pages/history';

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<HistoryPage />} path="/history/:key" />
    </Routes>
  );
}

export default App;
