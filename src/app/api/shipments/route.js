import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Helper to safely parse floats
const safeParseFloat = (val) => (val === null || val === undefined || val === '' ? null : parseFloat(val))

export async function POST(request) {
  try {
    const data = await request.json()

    const {
      name,
      location,
      products,
      agency,
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
      estimated_hours,
    } = data

    // Generate unique shipment code
    const code = 'SHP' + Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create shipment record
    const shipmentData = {
      code,
      name,
      location,
      products,
      agency,
      current_lat: safeParseFloat(origin_lat), // used as starting point only
      current_lng: safeParseFloat(origin_lng), // used as starting point only
      dest_lat: safeParseFloat(dest_lat),
      dest_lng: safeParseFloat(dest_lng),
      estimated_hours: parseInt(estimated_hours, 10) || null,
      progress: 0, // start at 0
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('shipments').insert([shipmentData])
    if (error) throw error

    return NextResponse.json({ code, message: 'Shipment created successfully' })
  } catch (err) {
    console.error('Error creating shipment:', err)
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 })
  }
}
export async function GET() {
  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 })
  }

  return NextResponse.json(shipments)
}
