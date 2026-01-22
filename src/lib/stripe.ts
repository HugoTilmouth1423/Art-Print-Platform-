import Stripe from 'stripe'

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

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
  const session = await stripe.checkout.sessions.create({
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
