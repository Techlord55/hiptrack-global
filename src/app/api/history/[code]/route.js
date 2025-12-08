import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request, { params }) {
  try {
    // --- Access the dynamic route parameter ---
    const resolvedParams = await params;
    const code = resolvedParams.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Shipment code is required' }, { status: 400 });
    }

    // --- Fetch shipment safely (case-insensitive) ---
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('*')
      .ilike('code', code); // case-insensitive match

    if (error || !shipments || shipments.length === 0) {
      console.log('Supabase error:', error, 'shipments:', shipments);
      return NextResponse.json({ error: 'Tracking code not found' }, { status: 404 });
    }

    const shipment = shipments[0];

    // --- Simulate History Events ---
    const history = [];

    // 1️⃣ Current / Final Status
    history.push({
      timestamp: shipment.updated_at,
      location: shipment.location || `${shipment.current_lat}, ${shipment.current_lng}`,
      status: shipment.status,
      remarks: `Shipment status updated to ${shipment.status}`,
    });

    // 2️⃣ In Transit / Progress Update
    if (shipment.progress > 0 && shipment.progress < 1 && shipment.created_at !== shipment.updated_at) {
      const createdTime = new Date(shipment.created_at).getTime();
      const updatedTime = new Date(shipment.updated_at).getTime();
      const midpointTime = new Date(createdTime + (updatedTime - createdTime) * 0.5).toISOString();

      history.push({
        timestamp: midpointTime,
        location: shipment.location || 'In Transit Location',
        status: 'In Transit',
        remarks: `Processing update. Progress: ${(shipment.progress * 100).toFixed(0)}%.`,
      });
    }

    // 3️⃣ Initial Booking
    history.push({
      timestamp: shipment.created_at,
      location: shipment.location || `${shipment.origin_lat}, ${shipment.origin_lng} (Origin)`,
      status: 'Booked / Pending',
      remarks: `Shipment created and booked on ${new Date(shipment.created_at).toLocaleDateString()}.`,
    });

    // --- Return simulated history ---
    return NextResponse.json({ history });
  } catch (err) {
    console.error('API History error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
