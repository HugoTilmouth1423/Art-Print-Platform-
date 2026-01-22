// Project status types
export type ProjectStatus =
  | 'paid_in_progress'
  | 'proof_ready'
  | 'revision_requested'
  | 'approved'
  | 'sent_to_print'
  | 'shipped'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  paid_in_progress: 'Paid – In Progress',
  proof_ready: 'Proof Ready',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  sent_to_print: 'Sent to Print',
  shipped: 'Shipped',
}

// Print size types
export type PrintSize = 'A4' | 'A3' | 'A2' | 'A1'

// Frame types
export type FrameType = 'none' | 'black' | 'white' | 'natural'

export const FRAME_LABELS: Record<FrameType, string> = {
  none: 'No Frame',
  black: 'Black Frame',
  white: 'White Frame',
  natural: 'Natural Wood Frame',
}

// Upload types
export type UploadType = 'reference' | 'layer' | 'texture'

// Layer roles for artwork
export type LayerRole = 'background' | 'ground' | 'shading' | 'highlight'

// Database types
export interface Project {
  id: string
  customer_email: string
  status: ProjectStatus
  size: PrintSize
  frame: FrameType
  price_paid: number // in pence
  stripe_session_id: string | null
  prodigi_order_id: string | null
  revision_used: boolean
  revision_notes: string | null
  created_at: string
  updated_at: string
}

export interface Upload {
  id: string
  project_id: string
  type: UploadType
  layer_role: LayerRole | null
  file_url: string
  created_at: string
}

export interface Palette {
  id: string
  project_id: string | null // null for global presets
  name: string | null
  colors: string[] // 5 hex colors
  is_selected: boolean
  is_preset: boolean
  created_at: string
}

// Layer mapping for artwork rendering
export interface LayerMapping {
  background: string // file_url
  ground: string
  shading: string
  highlight: string
  texture?: string
}

// Palette color structure
export interface PaletteColor {
  hex: string
  locked: boolean
}

// Pricing structure
export interface PriceConfig {
  size: Record<PrintSize, number>
  frame: Record<FrameType, number>
}

// Checkout session data
export interface CheckoutSessionData {
  project_id: string
  customer_email: string
  size: PrintSize
  frame: FrameType
  palette_colors: string[]
  reference_image_url: string
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
