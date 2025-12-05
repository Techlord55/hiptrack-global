import { NextResponse } from 'next/server'
import { query } from '@/lib/db.js'

// Helper function to safely convert an empty string to null, or to a float
function safeParseFloat(value) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return null
  }
  return parseFloat(value)
}

// --- GET all shipments (UNCHANGED) ---
export async function GET() {
  try {
    const shipments = await query('SELECT * FROM shipments ORDER BY created_at DESC')
    return NextResponse.json(shipments)
  } catch (err) {
    console.error('Error fetching shipments:', err)
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 })
  }
}

// --- POST a new shipment (UPDATED) ---
export async function POST(request) {
  try {
    const data = await request.json()
    const code = 'SHP' + Math.random().toString(36).substring(2, 8).toUpperCase()

    // Extract ALL fields from the form data
    const { 
      name, 
      location, 
      products, 
      agency, 
      origin_lat, 
      origin_lng, 
      dest_lat, 
      dest_lng,
      estimated_hours // 🔑 NEW: Extract estimated hours
    } = data

    const initialCurrentLat = safeParseFloat(origin_lat)
    const initialCurrentLng = safeParseFloat(origin_lng)
    
    const destinationLat = safeParseFloat(dest_lat)
    const destinationLng = safeParseFloat(dest_lng)

    // Convert hours to integer
    const hours = parseInt(estimated_hours, 10);
    // Use null if hours is invalid or zero, though form requires a number > 0
    const estimatedHoursValue = isNaN(hours) || hours <= 0 ? null : hours;


    // 🔑 SQL statement updated to include estimated_hours
 const sql = `
INSERT INTO shipments (
  code, 
  name, 
  location, 
  products, 
  agency, 
  current_lat,    
  current_lng, 
  dest_lat, 
  dest_lng,
  estimated_hours
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`
    // Total of 10 parameters (5 general + 4 coordinate fields + 1 hour field)
    await query(sql, [
      code, 
      name, 
      location, 
      products, 
      agency, 
      initialCurrentLat, 
      initialCurrentLng, 
      destinationLat, 
      destinationLng,
      estimatedHoursValue // 🔑 Insert the hours
    ])

    return NextResponse.json({ code, message: 'Shipment created' })
  } catch (err) {
    console.error('Error creating shipment:', err)
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 })
  }
}