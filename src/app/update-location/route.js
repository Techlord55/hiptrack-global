import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request) {
  try {
    const { code, lat, lng } = await request.json()
    
    const [result] = await pool.execute(
      'UPDATE shipments SET lat = ?, lng = ? WHERE code = ?',
      [parseFloat(lat), parseFloat(lng), code]
    )
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Location updated successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}