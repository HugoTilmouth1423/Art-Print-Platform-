import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

// Get Stripe instance (lazy initialization)
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(apiKey, {
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility - will throw if called without config
export const stripe = {
  checkout: {
    sessions: {
      create: async (params: Stripe.Checkout.SessionCreateParams) => {
        return getStripe().checkout.sessions.create(params)
      },
    },
  },
  webhooks: {
    constructEvent: (
      body: string,
      signature: string,
      secret: string,
    ): Stripe.Event => {
      return getStripe().webhooks.constructEvent(body, signature, secret)
    },
  },
}

// Create checkout session for a project
export async function createCheckoutSession({
  projectId,
  customerEmail,
  priceInPence,
  size,
  frame,
  successUrl,
  cancelUrl,
}: {
  projectId: string
  customerEmail: string
  priceInPence: number
  size: string
  frame: string
  successUrl: string
  cancelUrl: string
}) {
  const stripeClient = getStripe()

  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Custom Artwork - ${size}`,
            description: `Hand-drawn artwork, ${size} print${frame !== 'none' ? ` with ${frame} frame` : ''}`,
          },
          unit_amount: priceInPence,
        },
        quantity: 1,
      },
    ],
    metadata: {
      project_id: projectId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['GB'],
    },
  })

  return session
}
