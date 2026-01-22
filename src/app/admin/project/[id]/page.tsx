import { notFound } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { AdminProjectView } from '@/components/admin/admin-project-view'
import type { Project, Upload, Palette } from '@/types'

interface AdminProjectPageProps {
  params: Promise<{ id: string }>
}

async function getProject(id: string) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    return null
  }

  // Get uploads
  const { data: uploads } = await supabase
    .from('uploads')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  // Get palettes
  const { data: palettes } = await supabase
    .from('palettes')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return {
    project: project as Project,
    uploads: (uploads || []) as Upload[],
    palettes: (palettes || []) as Palette[],
  }
}

export default async function AdminProjectPage({
  params,
}: AdminProjectPageProps) {
  const { id } = await params
  const data = await getProject(id)

  if (!data) {
    notFound()
  }

  return (
    <AdminProjectView
      project={data.project}
      uploads={data.uploads}
      palettes={data.palettes}
    />
  )
}
