import { useState } from 'react'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [step, setStep] = useState('request')

  async function handleSendCode() {
    if (!email.trim() || !email.includes('@')) {
      setMessage('Please enter a valid email address.')
      setIsCodeSent(false)
      return
    }

    setIsSending(true)
    setMessage('Sending your verification code...')

    try {
      const response = await fetch('http://localhost:8000/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        setIsCodeSent(true)
        setStep('request')
        setMessage(responseData.message || `Verification code sent to ${email}`)
      } else {
        setIsCodeSent(false)
        setMessage(responseData.detail || responseData.message || 'Unable to send the verification code right now.')
      }
    } catch (error) {
      setIsCodeSent(false)
      setMessage('Network error. Please try again in a moment.')
    } finally {
      setIsSending(false)
    }
  }

  async function handleResetPassword() {
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address first.')
      return
    }

    if (step === 'password') {
      if (!password.trim() || !confirmPassword.trim()) {
        setMessage('Please enter and confirm your new password.')
        return
      }

      if (password.length < 6) {
        setMessage('Password must be at least 6 characters long.')
        return
      }

      if (password !== confirmPassword) {
        setMessage('Passwords do not match.')
        return
      }

      setIsUpdating(true)
      setMessage('Updating your password...')

      try {
        const response = await fetch('http://localhost:8000/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code,
            password,
            confirm_password: confirmPassword,
          }),
        })

        const responseData = await response.json()

        if (response.ok && responseData.success) {
          setMessage('Password updated successfully. You can now sign in with your new password.')
          setPassword('')
          setConfirmPassword('')
          setCode('')
          setStep('request')
          setIsCodeSent(false)
        } else {
          setMessage(responseData.detail || responseData.message || 'Unable to update the password right now.')
        }
      } catch (error) {
        setMessage('Network error. Please try again in a moment.')
      } finally {
        setIsUpdating(false)
      }

      return
    }

    if (!code.trim()) {
      setMessage('Please enter the verification code.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        setStep('password')
        setMessage('Code verified. Please choose a new password.')
      } else {
        setMessage(responseData.detail || responseData.message || 'The verification code is incorrect.')
      }
    } catch (error) {
      setMessage('Network error. Please try again in a moment.')
    }
  }

  return (
    <div className="forgot-shell">
      <style>{`
        .forgot-shell {
          min-height: calc(100vh - 90px);
          display: grid;
          place-items: center;
          padding: 32px 20px 48px;
          position: relative;
          overflow: hidden;
        }

        .forgot-shell::before,
        .forgot-shell::after {
          content: '';
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0.35;
          animation: floatBlob 8s ease-in-out infinite;
          pointer-events: none;
        }

        .forgot-shell::before {
          background: rgba(37, 99, 235, 0.2);
          top: -60px;
          left: -80px;
        }

        .forgot-shell::after {
          background: rgba(236, 72, 153, 0.2);
          right: -90px;
          bottom: -60px;
          animation-delay: 2s;
        }

        .forgot-card {
          position: relative;
          z-index: 1;
          width: min(100%, 980px);
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.1);
          backdrop-filter: blur(26px) saturate(140%);
          animation: fadeUp 0.8s ease both;
        }

        .forgot-hero {
          position: relative;
          padding: 42px;
          background: linear-gradient(135deg, #2563eb, #7c3aed 55%, #ec4899);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          overflow: hidden;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
          opacity: 0.75;
        }

        .orb-one {
          width: 180px;
          height: 180px;
          background: rgba(255, 255, 255, 0.22);
          top: -40px;
          right: -20px;
        }

        .orb-two {
          width: 220px;
          height: 220px;
          background: rgba(255, 255, 255, 0.16);
          bottom: -70px;
          left: -30px;
        }

        .forgot-kicker {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-size: 0.76rem;
          font-weight: 700;
          color: rgba(240, 249, 255, 0.9);
        }

        .forgot-hero h1 {
          margin: 0;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          line-height: 1.15;
          color: white;
        }

        .forgot-hero p {
          margin: 0;
          max-width: 360px;
          color: rgba(240, 249, 255, 0.88);
          font-size: 0.98rem;
          line-height: 1.65;
        }

        .hero-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 6px;
        }

        .hero-badges span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          color: white;
          font-size: 0.85rem;
          backdrop-filter: blur(10px);
        }

        .forgot-form {
          padding: 38px 34px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.96) 100%);
        }

        .form-header h2 {
          margin: 0 0 5px;
          font-size: 1.45rem;
          color: #111827;
        }

        .form-header p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #334155;
          font-size: 0.95rem;
        }

        .field input {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 14px;
          padding: 13px 14px;
          background: rgba(248, 250, 252, 0.9);
          color: #0f172a;
          transition: all 0.25s ease;
        }

        .field input::placeholder {
          color: #94a3b8;
        }

        .field input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14);
          background: white;
        }

        .code-row {
          display: flex;
          gap: 10px;
          align-items: end;
        }

        .code-field {
          flex: 1;
        }

        .send-btn,
        .reset-btn {
          border: none;
          border-radius: 14px;
          padding: 13px 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .send-btn:hover,
        .reset-btn:hover,
        .send-btn:focus-visible,
        .reset-btn:focus-visible {
          transform: translateY(-2px);
        }

        .send-btn {
          min-width: 112px;
          color: white;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          box-shadow: 0 16px 24px rgba(37, 99, 235, 0.18);
        }

        .reset-btn {
          width: 100%;
          color: white;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          box-shadow: 0 16px 24px rgba(236, 72, 153, 0.2);
        }

        .message {
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(240, 249, 255, 0.9);
          color: #334155;
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .message.success {
          background: rgba(220, 252, 231, 0.9);
          color: #166534;
          border-color: rgba(34, 197, 94, 0.3);
        }

        .message.error {
          background: rgba(254, 242, 242, 0.95);
          color: #991b1b;
          border-color: rgba(248, 113, 113, 0.35);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatBlob {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -12px, 0) scale(1.04);
          }
        }

        @media (max-width: 760px) {
          .forgot-card {
            grid-template-columns: 1fr;
          }

          .forgot-hero {
            padding: 28px 24px 24px;
          }

          .forgot-form {
            padding: 24px 20px 26px;
          }

          .code-row {
            flex-direction: column;
            align-items: stretch;
          }

          .send-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="forgot-card">
        <div className="forgot-hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <p className="forgot-kicker">Secure recovery</p>
          <h1>Reset your password</h1>
          <p>Enter your email, receive a verification code, and continue with confidence in just a few steps.</p>
          <div className="hero-badges">
            <span>🔐 Encrypted</span>
            <span>⚡ Fast access</span>
          </div>
        </div>

        <div className="forgot-form">
          <div className="form-header">
            <h2>Recover your account</h2>
            <p>We’ll help you get back in quickly while keeping everything secure.</p>
          </div>

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <div className="code-row">
            <label className="field code-field">
              <span>Verification code</span>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>

            <button type="button" className="send-btn" onClick={handleSendCode} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send code'}
            </button>
          </div>

          {step === 'password' ? (
            <>
              <label className="field">
                <span>New password</span>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
            </>
          ) : null}

          <button type="button" className="reset-btn" onClick={handleResetPassword} disabled={isUpdating}>
            {step === 'password' ? (isUpdating ? 'Saving...' : 'Save new password') : 'Verify code'}
          </button>
          {message ? (
            <div className={`message ${isCodeSent || step === 'password' ? 'success' : 'error'}`}>
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
