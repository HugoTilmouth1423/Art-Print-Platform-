import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createCheckoutSession } from '@/lib/stripe'
import { calculatePrice } from '@/constants/pricing'
import type { PrintSize, FrameType } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const image = formData.get('image') as File | null
    const email = formData.get('email') as string
    const size = formData.get('size') as PrintSize
    const frame = formData.get('frame') as FrameType
    const colorsJson = formData.get('colors') as string

    // Validate required fields
    if (!image || !email || !size || !frame || !colorsJson) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // Parse colors
    let colors: string[]
    try {
      colors = JSON.parse(colorsJson)
    } catch {
      return NextResponse.json(
        { error: 'Invalid colors format' },
        { status: 400 },
      )
    }

    // Calculate price
    const pricePaid = calculatePrice(size, frame)

    // Initialize Supabase admin client
    const supabase = createAdminClient()

    // Create project record
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        customer_email: email,
        status: 'paid_in_progress',
        size,
        frame,
        price_paid: pricePaid,
        revision_used: false,
      })
      .select()
      .single()

    if (projectError || !project) {
      console.error('Project creation error:', projectError)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 },
      )
    }

    // Upload reference image to storage
    const imageBuffer = await image.arrayBuffer()
    const imageExtension = image.name.split('.').pop() || 'jpg'
    const imagePath = `${project.id}/reference.${imageExtension}`

    const { error: uploadError } = await supabase.storage
      .from('artwork')
      .upload(imagePath, imageBuffer, {
        contentType: image.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      // Clean up project if upload fails
      await supabase.from('projects').delete().eq('id', project.id)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 },
      )
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('artwork')
      .getPublicUrl(imagePath)

    // Create upload record
    const { error: uploadRecordError } = await supabase.from('uploads').insert({
      project_id: project.id,
      type: 'reference',
      file_url: urlData.publicUrl,
    })

    if (uploadRecordError) {
      console.error('Upload record error:', uploadRecordError)
    }

    // Create initial palette
    const { error: paletteError } = await supabase.from('palettes').insert({
      project_id: project.id,
      colors,
      is_selected: true,
      is_preset: false,
    })

    if (paletteError) {
      console.error('Palette creation error:', paletteError)
    }

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createCheckoutSession({
      projectId: project.id,
      customerEmail: email,
      priceInPence: pricePaid,
      size,
      frame,
      successUrl: `${appUrl}/project/${project.id}?success=true`,
      cancelUrl: `${appUrl}/create?cancelled=true`,
    })

    // Update project with Stripe session ID
    await supabase
      .from('projects')
      .update({ stripe_session_id: session.id })
      .eq('id', project.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
