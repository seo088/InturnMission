import { Outlet } from 'react-router-dom'
import { UserFooter, UserHeader } from '../components/user/UserChrome'
import '../styles/user-home.css'
import '../styles/health-check-overrides.css'

export default function UserLayout() {
  return <div className="ar-user-shell"><UserHeader /><Outlet /><UserFooter /></div>
}
