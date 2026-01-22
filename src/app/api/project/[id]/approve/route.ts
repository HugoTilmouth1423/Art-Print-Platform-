import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { colors } = await request.json()

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

    // Check if project can be approved
    if (project.status !== 'proof_ready') {
      return NextResponse.json(
        { error: 'Project cannot be approved in current status' },
        { status: 400 },
      )
    }

    // Update the selected palette
    if (colors && colors.length === 5) {
      // Deselect all existing palettes
      await supabase
        .from('palettes')
        .update({ is_selected: false })
        .eq('project_id', id)

      // Create new palette as selected
      await supabase.from('palettes').insert({
        project_id: id,
        colors,
        is_selected: true,
        is_preset: false,
      })
    }

    // Update project status to approved
    const { error: updateError } = await supabase
      .from('projects')
      .update({ status: 'approved' })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update project status:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve project' },
        { status: 500 },
      )
    }

    // TODO: Trigger print order via Prodigi API
    // TODO: Send approval confirmation email

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
