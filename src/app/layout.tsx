import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={`${inter.className} antialiased min-h-screen bg-slate-950 text-slate-50`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
