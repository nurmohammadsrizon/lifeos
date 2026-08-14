import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const navigate = useNavigate();

  async function login() {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.status === true) {
      const tokenResponse = await fetch("http://localhost:8000/create-token-browser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          length: 32,
        }),
      });

      const tokenData = await tokenResponse.json();
      const userId = (email || "").trim() || "guest";
      localStorage.setItem("user_token", tokenData.token);
      localStorage.setItem("login_status", "true");
      localStorage.setItem("user_id", userId);
      onLoginSuccess?.(userId);
      setResult("Welcome back! You are now signed in.");
      navigate("/dashboard");
    } else {
      setResult(data.message || "Login failed");
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <p className="login-kicker">Welcome back</p>
          <h2>Grow your day with LifeOS</h2>
          <p className="login-copy">
            Organize your goals, routines, and ideas in one beautifully calm workspace.
          </p>
          <div className="hero-badges">
            <span>⚡ Fast onboarding</span>
            <span>✨ Smart focus</span>
            <span>🔒 Encrypted sync</span>
          </div>
          <div className="login-hero-stats">
            <div className="hero-stat">
              <strong>3x</strong>
              <span>Faster planning</span>
            </div>
            <div className="hero-stat">
              <strong>98%</strong>
              <span>Daily retention</span>
            </div>
          </div>
        </div>

        <div className="login-form">
          <div className="form-header">
            <h3>Sign in</h3>
            <p>Use your email and password to continue.</p>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="button" className="login-submit-btn" onClick={login}>
            Continue to Dashboard
          </button>

          <div className="form-footer">
            <a href="/register">Create account</a>
            <a href="/forgot-password">Forgot password?</a>
          </div>

          {result ? (
            <div className={`status-message ${result.includes("Welcome") ? "success" : ""}`}>
              {result}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Login;