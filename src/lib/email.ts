const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Holly <hello@customartwork.co.uk>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{
  success: boolean
  id?: string
  error?: string
}> {
  if (!RESEND_API_KEY) {
    console.log('Email would be sent (Resend not configured):', { to, subject })
    return { success: true, id: 'mock' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, id: data.id }
    } else {
      console.error('Resend error:', data)
      return { success: false, error: data.message || 'Failed to send email' }
    }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Email templates
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 600; color: #4A90A4; }
    .button { display: inline-block; background: #4A90A4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Custom Artwork</div>
  </div>
  ${content}
  <div class="footer">
    <p>Custom Artwork · Designed & printed in the UK</p>
  </div>
</body>
</html>
  `
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation({
  to,
  projectId,
  size,
  frame,
}: {
  to: string
  projectId: string
  size: string
  frame: string
}) {
  const projectUrl = `${APP_URL}/project/${projectId}`

  const html = emailWrapper(`
    <h1>Thank you for your order</h1>
    <p>We&apos;ve received your commission and are excited to start working on your artwork.</p>
    <p><strong>Order details:</strong></p>
    <ul>
      <li>Size: ${size}</li>
      <li>Frame: ${frame === 'none' ? 'No frame' : frame}</li>
    </ul>
    <p>Holly will begin creating your artwork shortly. You&apos;ll receive another email when your proof is ready for review.</p>
    <p><a href="${projectUrl}" class="button">View Your Order</a></p>
    <p>Questions? Just reply to this email.</p>
  `)

  return sendEmail({
    to,
    subject: 'Order confirmed – Your custom artwork is on its way',
    html,
  })
}

/**
 * Send proof ready email
 */
export async function sendProofReady({
  to,
  projectId,
}: {
  to: string
  projectId: string
}) {
  const projectUrl = `${APP_URL}/project/${projectId}`

  const html = emailWrapper(`
    <h1>Your proof is ready</h1>
    <p>Great news! Your custom artwork proof is ready for review.</p>
    <p>Take a look and make sure you&apos;re happy with everything. You can adjust the colour palette if you&apos;d like, or request one revision.</p>
    <p>Once you approve, we&apos;ll send it straight to print.</p>
    <p><a href="${projectUrl}" class="button">Review Your Proof</a></p>
  `)

  return sendEmail({
    to,
    subject: 'Your artwork proof is ready',
    html,
  })
}

/**
 * Send revision processed email
 */
export async function sendRevisionProcessed({
  to,
  projectId,
}: {
  to: string
  projectId: string
}) {
  const projectUrl = `${APP_URL}/project/${projectId}`

  const html = emailWrapper(`
    <h1>Your revision is complete</h1>
    <p>We&apos;ve made the changes you requested. Your updated proof is ready for review.</p>
    <p><a href="${projectUrl}" class="button">Review Updated Proof</a></p>
    <p>Once you&apos;re happy, click &quot;Approve &amp; Print&quot; to send it to production.</p>
  `)

  return sendEmail({
    to,
    subject: 'Your revised artwork is ready',
    html,
  })
}

/**
 * Send approved and printing email
 */
export async function sendApprovedAndPrinting({
  to,
  projectId,
}: {
  to: string
  projectId: string
}) {
  const projectUrl = `${APP_URL}/project/${projectId}`

  const html = emailWrapper(`
    <h1>Your artwork is being printed</h1>
    <p>Wonderful! Your artwork has been approved and is now being printed on premium paper.</p>
    <p>We&apos;ll send you another email with tracking information once it&apos;s on its way to you.</p>
    <p><a href="${projectUrl}" class="button">View Order Status</a></p>
  `)

  return sendEmail({
    to,
    subject: 'Your artwork is being printed',
    html,
  })
}

/**
 * Send shipped email
 */
export async function sendShipped({
  to,
  projectId,
  trackingNumber,
  trackingUrl,
}: {
  to: string
  projectId: string
  trackingNumber?: string
  trackingUrl?: string
}) {
  const projectUrl = `${APP_URL}/project/${projectId}`

  let trackingInfo = ''
  if (trackingNumber && trackingUrl) {
    trackingInfo = `<p><strong>Tracking number:</strong> <a href="${trackingUrl}">${trackingNumber}</a></p>`
  } else if (trackingNumber) {
    trackingInfo = `<p><strong>Tracking number:</strong> ${trackingNumber}</p>`
  }

  const html = emailWrapper(`
    <h1>Your artwork is on its way!</h1>
    <p>Your custom artwork has been shipped and is on its way to you.</p>
    ${trackingInfo}
    <p>It should arrive within 3-5 working days.</p>
    <p>We hope you love it as much as we loved creating it.</p>
    <p><a href="${projectUrl}" class="button">View Order</a></p>
  `)

  return sendEmail({
    to,
    subject: 'Your artwork has shipped',
    html,
  })
}
