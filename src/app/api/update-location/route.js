import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request) {
  try {
    const { code, lat, lng } = await request.json()

    const { data, error } = await supabase
      .from('shipments')
      .update({ current_lat: lat, current_lng: lng, updated_at: new Date().toISOString() })
      .eq('code', code)

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Location updated successfully' })
  } catch (err) {
    console.error('Error updating location:', err)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
