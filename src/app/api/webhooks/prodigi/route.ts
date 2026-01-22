import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendShipped } from '@/lib/email'

// Prodigi webhook payload types
interface ProdigiShipment {
  carrier: string
  tracking: {
    number: string
    url: string
  }
}

interface ProdigiWebhookPayload {
  event: string
  order: {
    id: string
    merchantReference: string
    status: {
      stage: string
    }
    shipments?: ProdigiShipment[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: ProdigiWebhookPayload = await request.json()

    console.log('Prodigi webhook received:', payload.event)

    const supabase = createAdminClient()
    const projectId = payload.order.merchantReference

    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      console.error('Project not found for Prodigi webhook:', projectId)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    switch (payload.event) {
      case 'order.status.shipped': {
        // Update project status
        await supabase
          .from('projects')
          .update({
            status: 'shipped',
            prodigi_order_id: payload.order.id,
          })
          .eq('id', projectId)

        // Send shipped email
        const shipment = payload.order.shipments?.[0]
        await sendShipped({
          to: project.customer_email,
          projectId,
          trackingNumber: shipment?.tracking?.number,
          trackingUrl: shipment?.tracking?.url,
        })

        console.log(`Project ${projectId} marked as shipped`)
        break
      }

      case 'order.status.complete': {
        // Order is complete (delivered)
        console.log(`Project ${projectId} order completed`)
        break
      }

      case 'order.status.cancelled': {
        // Order was cancelled
        console.error(`Project ${projectId} order was cancelled`)
        // TODO: Handle cancellation - maybe notify admin
        break
      }

      default:
        console.log(`Unhandled Prodigi event: ${payload.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Prodigi webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
