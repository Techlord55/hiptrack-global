// app/api/notify/route.js
import { supabase } from '@/lib/supabaseClient'

export async function POST(req) {
  try {
    const { email, shipmentCode } = await req.json()
    if (!email || !shipmentCode) {
      return new Response(JSON.stringify({ message: 'Email and shipment code are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Insert into a "notifications" table
    const { error } = await supabase.from('notifications').insert([
      { email, shipment_code: shipmentCode, created_at: new Date().toISOString() },
    ])

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'You will be notified when the shipment is delivered!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ message: 'Failed to submit notification' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
