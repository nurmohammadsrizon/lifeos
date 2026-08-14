const PlaceholderPage = ({ title, description }) => {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '640px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{title}</h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#c7d2fe' }}>
          {description || `${title} section is ready for your next update.`}
        </p>
      </div>
    </div>
  )
}

export default PlaceholderPage
