import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './components/layout/Topbar'
import Dashboard from './pages/Dashboard'
import Datasets from './pages/Datasets'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Mapping from './pages/Mapping'

export default function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <main className="max-w-[1520px] mx-auto px-7 py-7">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/kg"       element={<KnowledgeGraph />} />
          <Route path="/mapping"  element={<Mapping />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
