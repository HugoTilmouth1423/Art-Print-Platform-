import Link from 'next/link'
import { createClient } from '@/supabase/server'
import { PROJECT_STATUS_LABELS } from '@/types'
import { formatPrice } from '@/constants/pricing'
import type { Project } from '@/types'

async function getProjects() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch projects:', error)
    return []
  }

  return projects as Project[]
}

export default async function AdminPage() {
  const projects = await getProjects()

  // Group projects by status for quick overview
  const statusCounts = projects.reduce(
    (acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold">Projects</h1>
        <p className="text-muted-foreground mt-1">
          Manage customer artwork commissions
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            key: 'paid_in_progress',
            label: 'In Progress',
            color: 'bg-blue-100 text-blue-700',
          },
          {
            key: 'proof_ready',
            label: 'Proof Ready',
            color: 'bg-yellow-100 text-yellow-700',
          },
          {
            key: 'revision_requested',
            label: 'Revision',
            color: 'bg-orange-100 text-orange-700',
          },
          {
            key: 'approved',
            label: 'Approved',
            color: 'bg-green-100 text-green-700',
          },
          {
            key: 'sent_to_print',
            label: 'Printing',
            color: 'bg-purple-100 text-purple-700',
          },
          {
            key: 'shipped',
            label: 'Shipped',
            color: 'bg-gray-100 text-gray-700',
          },
        ].map((status) => (
          <div
            key={status.key}
            className="bg-card border-border rounded-lg border p-4"
          >
            <div className="text-2xl font-semibold">
              {statusCounts[status.key] || 0}
            </div>
            <div className="text-muted-foreground text-sm">{status.label}</div>
          </div>
        ))}
      </div>

      {/* Projects table */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Order
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Customer
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Size / Frame
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Amount
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Date
                </th>
                <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-muted-foreground px-6 py-12 text-center"
                  >
                    No projects yet
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/project/${project.id}`}
                        className="text-primary font-mono text-sm hover:underline"
                      >
                        #{project.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {project.customer_email}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {project.size} /{' '}
                      {project.frame === 'none' ? 'No frame' : project.frame}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatPrice(project.price_paid)}
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-sm">
                      {new Date(project.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/project/${project.id}`}
                        className="text-primary text-sm hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid_in_progress:
      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    proof_ready:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    revision_requested:
      'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    approved:
      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    sent_to_print:
      'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    shipped: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] ||
        status}
    </span>
  )
}
