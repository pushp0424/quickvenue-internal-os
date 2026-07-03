export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#012775',
        padding: '16px',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '448px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em' }}>
            Quick<span style={{ color: '#D4AF37' }}>Venue</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Internal OS
          </p>
        </div>
        {children}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '24px' }}>
          Access restricted to Quick Venue team members only
        </p>
      </div>
    </div>
  )
}