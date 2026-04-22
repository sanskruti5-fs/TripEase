import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import LandingPage from './pages/LandingPage'
import TripPlanner from './pages/TripPlanner.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RealTimePlanner from './pages/RealTimePlanner'


import FoodMarket from './pages/FoodMarket'
import GuidesReviews from './pages/GuidesReviews'
import Accommodation from './pages/Accommodation'
import BudgetSummary from './pages/BudgetSummary'
import DestinationHighlights from './pages/DestinationHighlights'
import TransportOptions from './pages/TransportOptions'
import AIItinerary from './pages/AIItinerary'

import ProtectedRoute from './components/ProtectedRoute'
function App() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/planner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
          <Route path="/real-time-planner" element={<ProtectedRoute><RealTimePlanner /></ProtectedRoute>} />

          <Route path="/food-market" element={<ProtectedRoute><FoodMarket /></ProtectedRoute>} />
          <Route path="/highlights" element={<ProtectedRoute><DestinationHighlights /></ProtectedRoute>} />
          <Route path="/guides" element={<ProtectedRoute><GuidesReviews /></ProtectedRoute>} />
          <Route path="/accommodation" element={<ProtectedRoute><Accommodation /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><TransportOptions /></ProtectedRoute>} />
          <Route path="/final-review" element={<ProtectedRoute><BudgetSummary /></ProtectedRoute>} />
          <Route path="/ai-itinerary" element={<ProtectedRoute><AIItinerary /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

export default App
