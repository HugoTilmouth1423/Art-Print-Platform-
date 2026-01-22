import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { ProjectStatus } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

const VALID_STATUSES: ProjectStatus[] = [
  'paid_in_progress',
  'proof_ready',
  'revision_requested',
  'approved',
  'sent_to_print',
  'shipped',
]

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const { status } = await request.json()

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Update project status
    const { error } = await adminClient
      .from('projects')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Status update error:', error)
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 },
      )
    }

    // TODO: If status is 'proof_ready', send email to customer
    // TODO: If status is 'sent_to_print', trigger Prodigi order
    // TODO: If status is 'shipped', send shipping confirmation email

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
