import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const texture = formData.get('texture') as File

    if (!projectId || !texture) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const adminClient = createAdminClient()

    // Verify project exists
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete existing texture if any
    const { data: existingTexture } = await adminClient
      .from('uploads')
      .select('id, file_url')
      .eq('project_id', projectId)
      .eq('type', 'texture')
      .single()

    if (existingTexture) {
      const url = new URL(existingTexture.file_url)
      const path = url.pathname.split('/').slice(-2).join('/')
      await adminClient.storage.from('artwork').remove([path])
      await adminClient.from('uploads').delete().eq('id', existingTexture.id)
    }

    // Upload new texture
    const buffer = await texture.arrayBuffer()
    const path = `${projectId}/paper_texture.png`

    const { error: uploadError } = await adminClient.storage
      .from('artwork')
      .upload(path, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('Texture upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload texture' },
        { status: 500 },
      )
    }

    const { data: urlData } = adminClient.storage
      .from('artwork')
      .getPublicUrl(path)

    // Create upload record
    const { error: recordError } = await adminClient.from('uploads').insert({
      project_id: projectId,
      type: 'texture',
      file_url: urlData.publicUrl,
    })

    if (recordError) {
      console.error('Failed to create texture record:', recordError)
      return NextResponse.json(
        { error: 'Failed to save texture record' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error('Texture upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
