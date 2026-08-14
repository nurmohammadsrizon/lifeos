import './LearnMore.css'

const features = [
  {
    title: 'Calm planning',
    description: 'Shape your priorities with clear routines, goals, and gentle reminders that never feel overwhelming.',
  },
  {
    title: 'AI guidance',
    description: 'Get smart suggestions for focus, habits, and momentum based on your real progress and patterns.',
  },
  {
    title: 'Visible growth',
    description: 'Track wins, milestones, and reflections in one beautiful space that keeps you moving forward.',
  },
]

const highlights = [
  'Daily focus plans with flexible scheduling',
  'Smart suggestions that adapt to your energy',
  'Beautiful dashboards for habits and goals',
  'Shared routines for teams and personal projects',
]

const galleryItems = [
  {
    title: 'Momentum view',
    description: 'See your progress at a glance through layered insights and calm visual storytelling.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Intentional routines',
    description: 'Build strong habits with guided check-ins and supportive reminders.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Clear focus',
    description: 'Keep distractions low and attention high with a calm, distraction-free workspace.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
]

function LearnMore() {
  return (
    <div className="learn-more-page">
      <div className="learn-more-shell">
        <section className="learn-more-hero">
          <div className="hero-copy">
            <h1>Learn what makes LifeOS feel effortless.</h1>
            <p>
              LifeOS brings your goals, habits, and ideas into one elegant operating system for daily life.
              It is designed to feel calm, useful, and inspiring from the first moment you open it.
            </p>
            <div className="hero-badges">
              <span>⚡ Faster planning</span>
              <span>🧠 AI-powered support</span>
              <span>🎯 Real progress tracking</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-panel">
              <h3>Built for momentum</h3>
              <p>Every feature is tuned to help you act clearly, reflect gently, and move steadily forward.</p>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="detail-grid">
          <article className="info-card">
            <h3>Why people love it</h3>
            <p>
              The experience blends structure and softness, giving you a workspace that feels focused without being rigid.
              Whether you are building a routine, planning a launch, or restoring healthy habits, LifeOS helps you stay grounded.
            </p>
          </article>

          <article className="list-card">
            <h3>What you get</h3>
            <ul>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="image-grid">
          {galleryItems.map((item) => (
            <article key={item.title} className="gallery-card">
              <img src={item.image} alt={item.title} />
              <div className="card-body">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default LearnMore
