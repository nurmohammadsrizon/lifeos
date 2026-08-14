import { NavLink } from 'react-router-dom'

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Download', path: '/download' },
      { label: 'Docs', path: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Login', path: '/login' },
    ],
  },
]

function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-card">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <span className="brand-mark">✦</span>
            <span>LifeOS</span>
          </div>
          <p>Organize ideas, habits, and momentum in one calm, intelligent workspace.</p>
          <div className="footer-badges">
            <span className="social-pill">AI-first</span>
            <span className="social-pill">Calm UI</span>
            <span className="social-pill">Realtime focus</span>
          </div>
        </div>

        <div className="footer-grid">
          {footerSections.map((section) => (
            <div key={section.title} className="footer-column">
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <NavLink to={link.path}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
