import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './index.css'
import App from './App.tsx'
import AuthCallback from './pages/AuthCallback.tsx'
import Home from './pages/Home.tsx'
import AdminPanel from './pages/AdminPanel.tsx'
import BiddingInterface from './pages/BiddingInterface.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

AOS.init({
  duration: 1000,
  once: false,
  offset: 100,
  mirror: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/bidding" element={<BiddingInterface />} />
        </Routes>
      </AuthProvider>
    </Router>
  </StrictMode>,
)
