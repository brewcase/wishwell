import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

// 🧠 CONCEPT: Custom React Hook
// This is a reusable function that manages authentication state
// Any component can use this to get current user info

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // 🔄 CONCEPT: Session Recovery
    // When page loads, check if user is already logged in
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      })
    }

    getSession()

    // 👂 CONCEPT: Event Listeners
    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event) // For debugging
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      }
    )

    // 🧹 CONCEPT: Cleanup
    // Remove listener when component unmounts (prevents memory leaks)
    return () => subscription.unsubscribe()
  }, [])

  // 📤 CONCEPT: Helper Functions
  // Provide easy-to-use auth functions to components
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user
  }
}
