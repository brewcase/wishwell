'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Logo from '@/components/icons/Logo'
import Button from '@/components/ui/Button'
import { Calendar, Users, Settings, Plus, Bell } from 'lucide-react'

// 🔐 CONCEPT: Protected Layout
// This layout ensures only authenticated users can access dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  // 🛡️ CONCEPT: Route Protection
  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // 📱 CONCEPT: Loading State
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // 🚪 CONCEPT: Unauthenticated State
  // Don't render anything if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 🧭 CONCEPT: Dashboard Navigation */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="sm" />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/dashboard/friends" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Friends
              </a>
              <a href="/dashboard/settings" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Settings
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 📊 CONCEPT: Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
