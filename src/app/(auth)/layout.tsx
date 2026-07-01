import { ThemeToggle } from '@/components/shared/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#012775] px-4 relative overflow-hidden">

      {/* Top-right theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow behind card */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#0244C6]/30 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo above card */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Quick<span className="text-[#D4AF37]">Venue</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">
            Internal OS
          </p>
        </div>

        {children}

        <p className="text-center text-white/25 text-xs">
          Access restricted to Quick Venue team members only
        </p>
      </div>
    </div>
  )
}