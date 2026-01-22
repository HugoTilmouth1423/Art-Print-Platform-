import { notFound } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { Header, Footer } from '@/components/layout'
import { ProjectView } from '@/components/project/project-view'
import type { Project, Upload, Palette } from '@/types'

interface ProjectPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
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

  // Get uploads for this project
  const { data: uploads } = await supabase
    .from('uploads')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  // Get palettes for this project
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

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id } = await params
  const { success } = await searchParams

  const data = await getProject(id)

  if (!data) {
    notFound()
  }

  const { project, uploads, palettes } = data
  const isNewOrder = success === 'true'

  return (
    <div className="flex min-h-screen flex-col">
      <Header showNav={false} />

      <main className="bg-muted/30 flex-1">
        <ProjectView
          project={project}
          uploads={uploads}
          palettes={palettes}
          isNewOrder={isNewOrder}
        />
      </main>

      <Footer />
    </div>
  )
}
