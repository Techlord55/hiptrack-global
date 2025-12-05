import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request) {
  try {
    const data = await request.json()
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const [result] = await pool.execute(
      'INSERT INTO shipments (code, name, location, products, agency, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code, data.name, data.location, data.products, data.agency, parseFloat(data.lat), parseFloat(data.lng)]
    )
    
    return NextResponse.json({ code, message: 'Shipment created successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM shipments ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 })
  }
}