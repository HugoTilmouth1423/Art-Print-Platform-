import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { notes } = await request.json()

    if (!notes || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Revision notes are required' },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()

    // Get current project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if project can request revision
    if (project.status !== 'proof_ready') {
      return NextResponse.json(
        { error: 'Revision can only be requested when proof is ready' },
        { status: 400 },
      )
    }

    if (project.revision_used) {
      return NextResponse.json(
        { error: 'Revision has already been used for this project' },
        { status: 400 },
      )
    }

    // Update project status and mark revision as used
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'revision_requested',
        revision_used: true,
        revision_notes: notes,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update project:', updateError)
      return NextResponse.json(
        { error: 'Failed to request revision' },
        { status: 500 },
      )
    }

    // TODO: Send revision request notification email to admin

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revision request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
