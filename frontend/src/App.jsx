import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Datasets from './pages/Datasets'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Mapping from './pages/Mapping'
import Poster from './pages/Poster'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#0a0c10',
        color: '#e2e8f0',
        fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1520, margin: '0 auto', padding: '28px' }}>
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/datasets" element={<Datasets />} />
              <Route path="/kg"       element={<KnowledgeGraph />} />
              <Route path="/mapping"  element={<Mapping />} />
              <Route path="/poster"   element={<Poster />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
