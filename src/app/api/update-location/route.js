import { NextResponse } from 'next/server'
import { query } from '@/lib/db.js' // use your DB helper

export async function POST(request) {
  try {
    const { code, lat, lng } = await request.json()

    // Update the shipment in the database
    const sql = `
      UPDATE shipments
      SET lat = ?, lng = ?, updated_at = CURRENT_TIMESTAMP
      WHERE code = ?
    `
    const result = await query(sql, [parseFloat(lat), parseFloat(lng), code.toUpperCase()])

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Shipment code not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Location updated' })
  } catch (err) {
    console.error('Error updating location:', err)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
