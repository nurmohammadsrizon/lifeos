import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navber from './components/Navber'
import Footer from './components/Footer'
import Home from './page/Home'
import Login from './page/Login'
import Register from './page/Register'
import LearnMore from './page/LearnMore'
import PlaceholderPage from './page/PlaceholderPage'
import ForgotPassword from './page/ForgotPassword'
import Dashboard from './user/Dashboard'
import Contact from './page/Contact'
import About from './page/About'
import Docs from './page/Docs'
import Profile from './user/Profile'
import Tester from './page/Tester'
import backgroundVideo from './presets/videos/backgound.mp4'
function ProtectedRoute({ children }) {
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('login_status') === 'true' && Boolean(localStorage.getItem('user_id'))

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('login_status') === 'true' && Boolean(localStorage.getItem('user_id'))
  })

  async function verifyBrowserSession() {
    const token = localStorage.getItem('user_token')
    const userId = localStorage.getItem('user_id')
    const savedStatus = localStorage.getItem('login_status') === 'true'

    if (!savedStatus || !userId) {
      localStorage.setItem('login_status', 'false')
      localStorage.removeItem('user_id')
      setIsLoggedIn(false)
      return
    }

    if (!token) {
      // Keep the user logged in if the browser session is already marked authenticated.
      setIsLoggedIn(true)
      return
    }

    try {
      const response = await fetch('http://localhost:8000/veryfy-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          running_status: true,
          token,
        }),
      })

      const data = await response.json()
      const loggedIn = Boolean(data?.success && data?.status)
      localStorage.setItem('login_status', String(loggedIn))
      if (!loggedIn) {
        localStorage.removeItem('user_id')
        localStorage.removeItem('user_token')
      }
      setIsLoggedIn(loggedIn)
    } catch (error) {
      localStorage.setItem('login_status', 'false')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_token')
      setIsLoggedIn(false)
    }
  }

  useEffect(() => {
    verifyBrowserSession()
  }, [])

  function handleLoginSuccess(userId = '') {
    localStorage.setItem('login_status', 'true')
    if (userId) {
      localStorage.setItem('user_id', userId)
    }
    setIsLoggedIn(true)
  }

  function handleLogout() {
    localStorage.setItem('login_status', 'false')
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_id')
    setIsLoggedIn(false)
  }

  return (
    <div className="app-page">
      <video className="background-video" autoPlay loop muted playsInline src={backgroundVideo} />
      <div className="video-overlay" />

      <Navber isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<PlaceholderPage title="Download" description="Download the LifeOS app and get started on your next milestone." />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/about" element={<About />} />
        {/* <Route path="/contact" element={<PlaceholderPage title="Contact" description="Reach out to the LifeOS team for support or feedback." />} /> */}
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<Tester />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
