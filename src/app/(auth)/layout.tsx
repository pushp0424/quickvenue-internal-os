import Image from 'next/image'

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
          <Image
            src="/logo-full.png"
            alt="QuickVenue"
            width={3261}
            height={827}
            style={{ height: '56px', width: 'auto', margin: '0 auto' }}
            priority
          />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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