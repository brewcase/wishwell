import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// 🔗 CONCEPT: Auth Callback Route
// This handles the redirect after email confirmation
// Supabase sends users here with an auth token

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // 📧 CONCEPT: Exchange Code for Session
    // The code from email gets exchanged for a proper session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 🚀 CONCEPT: Post-Auth Redirect
  // After successful confirmation, redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
