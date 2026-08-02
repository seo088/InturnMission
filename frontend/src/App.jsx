import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UserHome from './pages/UserHome'
import HealthCheck from './pages/HealthCheck'
import AdminLayout from './layouts/AdminLayout'
import Datasets from './pages/Datasets'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Mapping from './pages/Mapping'
import Poster from './pages/Poster'
import IndexPage from './pages/IndexPage'
import Scenario from './pages/Scenario'
import Costs from './pages/Costs'
import AnimalSearch from './pages/AnimalSearch'
import PetCare from './pages/PetCare'
import VeterinarySymptomReview from './pages/VeterinarySymptomReview'
import UserLayout from './layouts/UserLayout'
import UserDashboard from './pages/UserDashboard'
import Account from './pages/Account'
import HealthRecords from './pages/HealthRecords'
import CareSchedule from './pages/CareSchedule'
import SavedPlaces from './pages/SavedPlaces'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route element={<UserLayout />}>
          <Route path="/health-check" element={<HealthCheck />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="/pet-care" element={<PetCare />} />
          <Route path="/my" element={<UserDashboard />} />
          <Route path="/my/records" element={<HealthRecords />} />
          <Route path="/my/schedule" element={<CareSchedule />} />
          <Route path="/my/saved" element={<SavedPlaces />} />
          <Route path="/account" element={<Account />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/kg" element={<KnowledgeGraph />} />
          <Route path="/mapping" element={<Mapping />} />
          <Route path="/poster" element={<Poster />} />
          <Route path="/IndexPage" element={<IndexPage />} />
          <Route path="/scenario" element={<Scenario />} />
          <Route path="/animals" element={<AnimalSearch />} />
          <Route path="/vet/symptom-review" element={<VeterinarySymptomReview />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
