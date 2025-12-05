import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

const safeParseFloat = (val) => (val === null || val === undefined || val === '' ? 0 : parseFloat(val))

export async function GET(request, { params }) {
  try {
  const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: 'Missing tracking code' }, { status: 400 })
    }

    // Fetch shipment
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !shipment) {
      return NextResponse.json({ error: 'Tracking code not found' }, { status: 404 })
    }

    // Use initial current_lat/lng as starting point
    const startLat = safeParseFloat(shipment.current_lat)
    const startLng = safeParseFloat(shipment.current_lng)
    const destLat = safeParseFloat(shipment.dest_lat)
    const destLng = safeParseFloat(shipment.dest_lng)
    const estimatedHours = shipment.estimated_hours || 0
    const createdAt = new Date(shipment.created_at)

    // Calculate progress
    let simulatedProgress = shipment.progress ?? 0
    if (estimatedHours > 0) {
      const elapsed = Date.now() - createdAt.getTime()
      simulatedProgress = elapsed / (estimatedHours * 3600 * 1000)
      simulatedProgress = Math.max(0, Math.min(1, simulatedProgress)) // clamp 0–1
    }

    // Compute new current coordinates
    const currentLat = startLat + simulatedProgress * (destLat - startLat)
    const currentLng = startLng + simulatedProgress * (destLng - startLng)

    // Log progress and coordinates to console
    console.log(`--- Shipment ${code} ---`)
    console.log(`Progress: ${(simulatedProgress * 100).toFixed(2)}%`)
    console.log(`Current Lat: ${currentLat.toFixed(5)}, Current Lng: ${currentLng.toFixed(5)}`)
    console.log(`Destination Lat: ${destLat.toFixed(5)}, Destination Lng: ${destLng.toFixed(5)}`)

    // Update DB only if changed
    if (
      simulatedProgress !== shipment.progress ||
      currentLat !== shipment.current_lat ||
      currentLng !== shipment.current_lng
    ) {
      const { error: updateError } = await supabase
        .from('shipments')
        .update({
          progress: simulatedProgress,
          current_lat: currentLat,
          current_lng: currentLng,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipment.id)

      if (updateError) console.error('Error updating shipment progress:', updateError)
    }

    return NextResponse.json({
      id: shipment.id,
      code: shipment.code,
      name: shipment.name,
      location: shipment.location,
      products: shipment.products,
      agency: shipment.agency,
      created_at: shipment.created_at,
      updated_at: shipment.updated_at,
      estimated_hours: shipment.estimated_hours,
      progress: simulatedProgress,
      current_lat: currentLat,
      current_lng: currentLng,
      dest_lat: destLat,
      dest_lng: destLng,
      status: simulatedProgress < 1 ? 'In Transit' : 'Delivered',
    })
  } catch (err) {
    console.error('Error fetching tracking data:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
