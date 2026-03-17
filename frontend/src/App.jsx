import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Datasets from './pages/Datasets'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Mapping from './pages/Mapping'
import Poster from './pages/Poster'
import IndexPage from './pages/IndexPage'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 228, padding: '28px 32px', minWidth: 0, maxWidth: 'calc(100vw - 228px)' }}>
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/kg"       element={<KnowledgeGraph />} />
            <Route path="/mapping"  element={<Mapping />} />
            <Route path="/poster"   element={<Poster />} />
            <Route path="/IndexPage"   element={<IndexPage />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
