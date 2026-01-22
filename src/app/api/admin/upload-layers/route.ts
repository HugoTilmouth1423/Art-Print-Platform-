import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { LayerRole } from '@/types'

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
    const layers = formData.getAll('layers') as File[]
    const roles = formData.getAll('roles') as LayerRole[]

    if (!projectId || layers.length === 0) {
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

    // Delete existing layer uploads for this project
    const { data: existingUploads } = await adminClient
      .from('uploads')
      .select('id, file_url')
      .eq('project_id', projectId)
      .eq('type', 'layer')

    if (existingUploads && existingUploads.length > 0) {
      // Delete from storage
      const filePaths = existingUploads.map((u) => {
        const url = new URL(u.file_url)
        return url.pathname.split('/').slice(-2).join('/')
      })
      await adminClient.storage.from('artwork').remove(filePaths)

      // Delete records
      await adminClient
        .from('uploads')
        .delete()
        .eq('project_id', projectId)
        .eq('type', 'layer')
    }

    // Upload new layers
    const uploadPromises = layers.map(async (file, index) => {
      const role = roles[index]
      if (!role) return null

      const buffer = await file.arrayBuffer()
      const filename = `layer_${role}.png`
      const path = `${projectId}/${filename}`

      const { error: uploadError } = await adminClient.storage
        .from('artwork')
        .upload(path, buffer, {
          contentType: 'image/png',
          upsert: true,
        })

      if (uploadError) {
        console.error(`Failed to upload ${role}:`, uploadError)
        return null
      }

      const { data: urlData } = adminClient.storage
        .from('artwork')
        .getPublicUrl(path)

      // Create upload record
      const { error: recordError } = await adminClient.from('uploads').insert({
        project_id: projectId,
        type: 'layer',
        layer_role: role,
        file_url: urlData.publicUrl,
      })

      if (recordError) {
        console.error(`Failed to create record for ${role}:`, recordError)
        return null
      }

      return { role, url: urlData.publicUrl }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter((r) => r !== null)

    if (successful.length === 0) {
      return NextResponse.json({ error: 'All uploads failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      uploaded: successful.length,
      layers: successful,
    })
  } catch (error) {
    console.error('Layer upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
