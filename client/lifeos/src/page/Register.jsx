import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState("")

  async function HandelSignUP() {
    const response = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        full_name: fullName,
        user_name: userName,
      }),
    })
    const data = await response.json()

    if (data.status) {
      const userId = userName || email || 'guest'
      localStorage.setItem('login_status', 'true')
      localStorage.setItem('user_id', userId)
      localStorage.setItem('user_name', userName)
      localStorage.setItem('email', email)
      setResult(data.message)
      navigate('/dashboard')
      return
    }

    setResult(data.message)
  }

  return (
    <div className="login-shell register-shell">
      <div className="login-card register-card">
        <div className="login-hero register-hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <p className="login-kicker">Start your journey</p>
          <h2>Create your LifeOS account.</h2>
          <p className="login-copy">
            Build your own calm command center for habits, planning, and focus.
          </p>
          <div className="hero-badges">
            <span>🎯 Goal tracking</span>
            <span>🌈 Personal growth</span>
          </div>
        </div>

        <div className="login-form register-form">
          <div className="form-header">
            <h3>Create account</h3>
            <p>Join thousands of people organizing life in one place.</p>
          </div>

          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              name="full_name"
              id="full_name"
              placeholder="Your full name"
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              name="user_name"
              id="user_name"
              placeholder="Choose a username"
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Create a strong password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button className="login-btn" onClick={HandelSignUP} type="button">
            Create account
          </button>

          <div className="form-footer">
            <a href="/login">Already have an account?</a>
          </div>

          {result ? <div className="status-message">{result}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default Register
