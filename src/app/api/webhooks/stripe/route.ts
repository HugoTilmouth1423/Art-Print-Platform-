import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-admin'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const projectId = session.metadata?.project_id

      if (projectId) {
        // Update project status to confirmed paid
        const { error } = await supabase
          .from('projects')
          .update({
            stripe_session_id: session.id,
            // Project is already in 'paid_in_progress' status
          })
          .eq('id', projectId)

        if (error) {
          console.error('Failed to update project after payment:', error)
        }

        // TODO: Send order confirmation email
        console.log(`Payment completed for project ${projectId}`)
      }
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const projectId = session.metadata?.project_id

      if (projectId) {
        // Delete the project if checkout expired
        await supabase.from('projects').delete().eq('id', projectId)
        console.log(`Checkout expired, deleted project ${projectId}`)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
