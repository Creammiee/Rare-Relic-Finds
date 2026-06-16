import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in first' })
  }

  // Check if profile exists
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    // Insert new profile as developer
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      role: 'developer',
      status: 'active',
      full_name: 'Timothy'
    })
    
    if (error) {
      return NextResponse.json({ error: 'Failed to create developer profile', details: error })
    }
  } else {
    // Update existing profile to developer
    const { error } = await supabase.from('profiles').update({
      role: 'developer',
      full_name: 'Timothy'
    }).eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to upgrade existing profile', details: error })
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: 'You are now a Developer! Go back to localhost:3000 and refresh the page.' 
  })
}
