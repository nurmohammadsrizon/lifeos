import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const links = [
  { label: 'Home', path: '/' },
  { label: 'Download', path: '/download' },
  { label: 'Docs', path: '/docs' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

function Navber({ isLoggedIn, onLogout }) {
  const navigate = useNavigate()
  const [profilePicture, setProfilePicture] = useState(null)

  useEffect(() => {
    if (isLoggedIn) {
      async function loadProfilePicture() {
        try {
          const identifier = localStorage.getItem('user_id') || localStorage.getItem('email') || localStorage.getItem('user_name')
          if (!identifier) return

          const response = await fetch(`http://127.0.0.1:8000/profile/${encodeURIComponent(identifier)}`)
          const data = await response.json()
          if (data?.profile?.profile_picture) {
            setProfilePicture(data.profile.profile_picture)
          }
        } catch (error) {
          console.error('Failed to load profile picture:', error)
        }
      }
      loadProfilePicture()
    } else {
      setProfilePicture(null)
    }
  }, [isLoggedIn])

  function handleAuthClick(event) {
    if (isLoggedIn) {
      event.preventDefault()
      onLogout?.()
    }
  }

  function handleProfileClick() {
    if (isLoggedIn) {
      navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  const renderedLinks = [...links]
  if (isLoggedIn) {
    renderedLinks.splice(3, 0, { label: 'Dashboard', path: '/dashboard' })
  }

  return (
    <header className="navbar-shell">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink className="brand" to="/">
          <span className="brand-mark">✦</span>
          <span>LifeOS</span>
        </NavLink>

        <div className="nav-links">
          {renderedLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <button className="profile-btn" type="button" aria-label="Profile" onClick={handleProfileClick}>
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-btn-image" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
            )}
          </button>
          {isLoggedIn ? (
            <button className="login-btn" type="button" onClick={handleAuthClick}>
              Logout
            </button>
          ) : (
            <NavLink className="login-btn" to="/login">
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navber
