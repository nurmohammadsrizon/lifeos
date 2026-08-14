import React, { useState, useEffect } from 'react'
import './Home.css'

const Home = () => {
  const [quote, setQuote] = useState({
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
  })
  const [loading, setLoading] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(0)
  const [counters, setCounters] = useState({ activeUsers: 0, successRate: 0, supportHours: 0 })
  const [email, setEmail] = useState('')
  const [subscriptionMessage, setSubscriptionMessage] = useState('')
  const [savedQuotes, setSavedQuotes] = useState([])

  const quotes = [
    {
      text: 'The future belongs to those who believe in the beauty of their dreams.',
      author: 'Eleanor Roosevelt',
    },
    {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
    },
    {
      text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill',
    },
    {
      text: 'Believe you can and you\'re halfway there.',
      author: 'Theodore Roosevelt',
    },
    {
      text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
      author: 'Chinese Proverb',
    },
    {
      text: 'Your only limit is your soul.',
      author: 'Unknown',
    },
  ]

  const features = [
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set, monitor, and achieve your goals with AI-powered insights and personalized recommendations.',
      detail: 'Your daily goals, milestones, and timelines live in one vibrant dashboard so every win is visible.',
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Your personal AI mentor provides guidance, motivation, and adaptive strategies 24/7.',
      detail: 'Get real-time suggestions, momentum boosters, and reminders tailored to how you actually work.',
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Visualize your progress with beautiful charts and detailed analytics to stay motivated.',
      detail: 'Track streaks, time saved, and performance trends with advanced visuals that feel alive.',
    },
  ]

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Support' },
  ]

  const journeySteps = [
    { title: 'Clarify', description: 'Capture your next milestone in a crisp, motivating goal statement.' },
    { title: 'Shape', description: 'Let LifeOS turn your ambition into a practical and achievable action plan.' },
    { title: 'Grow', description: 'Review your progress and keep momentum with guided insights and support.' },
  ]

  useEffect(() => {
    fetchQuote()
    animateCounters()
  }, [])

  const fetchQuote = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://api.quotable.io/random?tags=success,motivation', {
        headers: { Accept: 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        setQuote({
          text: data.content,
          author: data.author.replace(', type.fit', ''),
        })
      } else {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        setQuote(randomQuote)
      }
    } catch (error) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setQuote(randomQuote)
    }
    setLoading(false)
  }

  const animateCounters = () => {
    const start = performance.now()
    const duration = 1500
    const targets = { activeUsers: 10240, successRate: 95, supportHours: 24 }

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      setCounters({
        activeUsers: Math.floor(8000 + (targets.activeUsers - 8000) * progress),
        successRate: Math.floor(70 + (targets.successRate - 70) * progress),
        supportHours: Math.floor(12 + (targets.supportHours - 12) * progress),
      })
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }

  const handleSubscribe = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      setSubscriptionMessage('Enter a valid email to join the momentum list.')
      return
    }

    setSubscriptionMessage(`Awesome! You will receive updates at ${email}.`)
    setEmail('')
    window.setTimeout(() => setSubscriptionMessage(''), 5000)
  }

  const handleSaveQuote = () => {
    if (!savedQuotes.includes(quote.text)) {
      setSavedQuotes((prev) => [quote.text, ...prev].slice(0, 3))
    }
  }

  return (
    <div className="home-page">
      <div className="home-background-grid">
        <div className="home-grid-glow home-glow-1"></div>
        <div className="home-grid-glow home-glow-2"></div>
        <div className="home-grid-glow home-glow-3"></div>
      </div>

      <div className="home-content">
        <section className="home-hero-section">
          <div className="home-hero-glow"></div>
          <div className="home-hero-panel home-hero-3d-card">
            <span className="home-hero-badge">AI-powered life operating system</span>
            <h1 className="home-hero-title">LifeOS</h1>
            <p className="home-hero-subtitle home-hero-copy">
              Build momentum with a vibrant goal system, animated insights, and generative self-improvement tools designed for high achievers.
            </p>
            <div className="home-hero-cta">
              <a href="/download" className="cta-button primary">
                Launch the App
              </a>
              <a href="#overview" className="cta-button secondary">
                Explore the Flow
              </a>
            </div>
            <div className="home-hero-highlights home-hero-deck">
              <div className="home-hero-stats-card">
                <span className="home-stat-value">{counters.activeUsers.toLocaleString()}</span>
                <span className="home-stat-text">Users thriving</span>
              </div>
              <div className="home-hero-stats-card">
                <span className="home-stat-value">{counters.successRate}%</span>
                <span className="home-stat-text">Goal completion</span>
              </div>
              <div className="home-hero-stats-card">
                <span className="home-stat-value">{counters.supportHours}</span>
                <span className="home-stat-text">AI support</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-overview-section" id="overview">
          <div className="home-overview-grid">
            <div className="home-overview-card home-overview-card-glow">
              <h3>Live goal preview</h3>
              <p>See a sample progress board with focus tasks, streaks, and a 3D progress pulse that makes achievement feel real.</p>
              <div className="progress-chip success">Growth X</div>
              <div className="progress-chip highlight">Momentum</div>
              <div className="progress-chip">Weekly win streak</div>
            </div>
            <div className="home-overview-card home-overview-card-panel">
              <div className="home-panel-header">
                <span>Focus Mode</span>
                <strong>Active Sprint</strong>
              </div>
              <div className="home-panel-inner">
                <div className="home-panel-line">
                  <span>Priority task</span>
                  <strong>Write your breakthrough plan</strong>
                </div>
                <div className="home-panel-progress">
                  <div className="home-panel-progress-bar" style={{ width: '72%' }}></div>
                </div>
                <div className="home-panel-meta">
                  <span>72% complete</span>
                  <span>Next checkpoint: 4h</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-features-section">
          <h2 className="home-section-title">Advanced capabilities</h2>
          <div className="home-features-grid home-interactive-features">
            {features.map((feature, index) => (
              <button
                key={index}
                className={`home-feature-card home-feature-card-interactive ${selectedFeature === index ? 'active' : ''}`}
                onClick={() => setSelectedFeature(index)}
              >
                <div className="home-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </button>
            ))}
          </div>
          <div className="home-feature-detail-card">
            <h3>{features[selectedFeature].title}</h3>
            <p>{features[selectedFeature].detail}</p>
            <div className="home-experience-pill">3D dashboard preview</div>
            <div className="home-experience-pill">Live AI cues</div>
            <div className="home-experience-pill">Momentum score</div>
          </div>
        </section>

        <section className="home-workflow-section">
          <h2 className="home-section-title">How your momentum grows</h2>
          <div className="home-workflow-grid">
            {journeySteps.map((step, index) => (
              <div key={index} className="home-workflow-card">
                <div className="home-workflow-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="home-stats-section home-stats-gradient">
          <div className="home-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="home-stat-card home-stat-card-floating">
                <div className="home-stat-number">{stat.number}</div>
                <div className="home-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-testimonial-section home-testimonial-3d">
          <div className="home-testimonial-card home-testimonial-panel">
            <p className="home-testimonial-text">"{quote.text}"</p>
            <p className="home-testimonial-author">— {quote.author}</p>
            <div className="home-testimonial-actions">
              <button className="home-quote-button" onClick={fetchQuote}>
                {loading ? 'Loading...' : 'Inspire me again'}
              </button>
              <button className="home-quote-button home-quote-button-secondary" onClick={handleSaveQuote}>
                Save Quote
              </button>
            </div>
          </div>
          <div className="home-saved-quotes-card">
            <h3>Saved inspiration</h3>
            {savedQuotes.length > 0 ? (
              <ul>
                {savedQuotes.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            ) : (
              <p>No saved quotes yet. Tap "Save Quote" to lock one in.</p>
            )}
          </div>
        </section>

        <section className="home-subscribe-section">
          <div className="home-subscribe-panel">
            <div>
              <h2>Stay in sync with your most productive self</h2>
              <p>Join the LifeOS launch list for fresh insights, new releases, and exclusive productivity boosts.</p>
            </div>
            <form className="home-subscribe-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="cta-button primary" type="submit">
                Join the list
              </button>
            </form>
            {subscriptionMessage && <p className="home-subscription-message">{subscriptionMessage}</p>}
          </div>
        </section>

        <section className="home-cta-section">
          <div className="home-cta-box home-cta-advanced">
            <h2>Ready to transform your life?</h2>
            <p>
              Join thousands of people who are already achieving their goals with LifeOS. Start your journey
              today and unlock your potential with AI-powered guidance.
            </p>
            <a href="/download" className="cta-button primary">
              Start Your Journey
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
