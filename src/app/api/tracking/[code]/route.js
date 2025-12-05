import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: 'Missing tracking code' }, { status: 400 });
    }

    // Fetch shipment from DB
    const [rows] = await pool.execute(
      `SELECT 
          id,
          code,
          name,
          location,
          products,
          agency,
          current_lat,
          current_lng,
          dest_lat,
          dest_lng,
          progress,
          estimated_hours,
          created_at,
          updated_at
       FROM shipments
       WHERE code = ?`,
      [code.toUpperCase()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tracking code not found' }, { status: 404 });
    }

    const shipment = rows[0];

    // --- Simulate movement using progress or estimated_hours ---
    const startLat = parseFloat(shipment.current_lat) || 0;
    const startLng = parseFloat(shipment.current_lng) || 0;
    const destLat = parseFloat(shipment.dest_lat) || startLat;
    const destLng = parseFloat(shipment.dest_lng) || startLng;
    const estimatedHours = parseFloat(shipment.estimated_hours) || 0;
    const createdAt = shipment.created_at ? new Date(shipment.created_at) : new Date();

    let simulatedProgress = shipment.progress ?? 0; // use stored progress if exists
    if (simulatedProgress === 0 && estimatedHours > 0) {
      simulatedProgress = (Date.now() - createdAt.getTime()) / (estimatedHours * 3600 * 1000);
      simulatedProgress = Math.max(0, Math.min(1, simulatedProgress));
    }

    const currentLat = startLat + simulatedProgress * (destLat - startLat);
    const currentLng = startLng + simulatedProgress * (destLng - startLng);
  console.log(`--- Tracking Update for ${code} ---`)
        console.log(`Progress: ${Math.round(simulatedProgress * 100)}%`)
        console.log(`Lat ${currentLat.toFixed(5)}, Lng ${currentLng.toFixed(5)}`)
    // Return full shipment data + simulated coords + status
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
  dest_lng: destLng, // ← corrected
  status: simulatedProgress < 1 ? 'In Transit' : 'Delivered'
});

  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}