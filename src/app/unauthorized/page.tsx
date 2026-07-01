import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <h1 className="text-3xl font-bold text-[#012775]">403 — Not Authorized</h1>
      <p className="text-muted-foreground">You don't have permission to view this page.</p>
      <Link href="/" className="text-[#0244C6] hover:underline">Return to your dashboard</Link>
    </div>
  )
}