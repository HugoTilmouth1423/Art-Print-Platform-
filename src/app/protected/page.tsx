import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Redirect to admin dashboard if authenticated
  redirect('/admin')
}
