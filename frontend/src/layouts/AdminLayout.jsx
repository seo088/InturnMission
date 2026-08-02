import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
