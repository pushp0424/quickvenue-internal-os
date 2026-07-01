import { AuthProvider } from '@/context/auth.provider'
import { QueryProvider } from '@/context/query-provider'
import { ThemeProvider } from '@/context/theme-provider'
import './globals.css'

export const metadata = {
  title: 'Quick Venue OS',
  description: 'Internal operating system for Quick Venue',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}