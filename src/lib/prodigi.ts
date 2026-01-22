import type { PrintSize, FrameType } from '@/types'
import { PRODIGI_SKUS } from '@/constants/pricing'

const PRODIGI_API_URL =
  process.env.PRODIGI_API_URL || 'https://api.sandbox.prodigi.com/v4.0'
const PRODIGI_API_KEY = process.env.PRODIGI_API_KEY

interface ProdigiAddress {
  line1: string
  line2?: string
  postalOrZipCode: string
  countryCode: string
  townOrCity: string
  stateOrCounty?: string
}

interface ProdigiRecipient {
  name: string
  email?: string
  address: ProdigiAddress
}

interface ProdigiOrderItem {
  sku: string
  copies: number
  sizing: 'fillPrintArea' | 'fitPrintArea' | 'stretchToPrintArea'
  assets: Array<{
    printArea: string
    url: string
  }>
}

interface ProdigiOrderResponse {
  outcome: string
  order?: {
    id: string
    status: {
      stage: string
      issues: Array<{ errorCode: string; description: string }>
    }
  }
  traceParent?: string
}

/**
 * Create a print order with Prodigi
 */
export async function createProdigiOrder({
  projectId,
  size,
  frame,
  imageUrl,
  recipient,
}: {
  projectId: string
  size: PrintSize
  frame: FrameType
  imageUrl: string
  recipient: ProdigiRecipient
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  if (!PRODIGI_API_KEY) {
    console.error('Prodigi API key not configured')
    return { success: false, error: 'Print service not configured' }
  }

  const sku = PRODIGI_SKUS[size][frame]

  const orderPayload = {
    merchantReference: projectId,
    shippingMethod: 'Standard',
    recipient: {
      name: recipient.name,
      email: recipient.email,
      address: {
        line1: recipient.address.line1,
        line2: recipient.address.line2,
        postalOrZipCode: recipient.address.postalOrZipCode,
        countryCode: 'GB',
        townOrCity: recipient.address.townOrCity,
        stateOrCounty: recipient.address.stateOrCounty,
      },
    },
    items: [
      {
        sku,
        copies: 1,
        sizing: 'fillPrintArea',
        assets: [
          {
            printArea: 'default',
            url: imageUrl,
          },
        ],
      },
    ] as ProdigiOrderItem[],
  }

  try {
    const response = await fetch(`${PRODIGI_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PRODIGI_API_KEY,
      },
      body: JSON.stringify(orderPayload),
    })

    const data: ProdigiOrderResponse = await response.json()

    if (data.outcome === 'Created' && data.order) {
      return { success: true, orderId: data.order.id }
    } else {
      console.error('Prodigi order failed:', data)
      return {
        success: false,
        error:
          data.order?.status?.issues?.[0]?.description ||
          'Order creation failed',
      }
    }
  } catch (error) {
    console.error('Prodigi API error:', error)
    return { success: false, error: 'Failed to connect to print service' }
  }
}

/**
 * Get order status from Prodigi
 */
export async function getProdigiOrderStatus(orderId: string): Promise<{
  success: boolean
  status?: string
  error?: string
}> {
  if (!PRODIGI_API_KEY) {
    return { success: false, error: 'Print service not configured' }
  }

  try {
    const response = await fetch(`${PRODIGI_API_URL}/orders/${orderId}`, {
      headers: {
        'X-API-Key': PRODIGI_API_KEY,
      },
    })

    const data = await response.json()

    if (data.outcome === 'Ok' && data.order) {
      return { success: true, status: data.order.status.stage }
    } else {
      return { success: false, error: 'Failed to get order status' }
    }
  } catch (error) {
    console.error('Prodigi status check error:', error)
    return { success: false, error: 'Failed to connect to print service' }
  }
}
