'use client'

import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { User } from '@/lib/api'
// import { User } from '@/lib/storage'
import Dashboard from '@/components/Dashboard'
import AuthForm from '@/components/AuthForm'
import { Toaster } from '@/components/ui/sonner'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)

    // Listen for auth changes
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {user ? <Dashboard user={user} /> : <AuthForm />}
      <Toaster />
    </main>
  )
}