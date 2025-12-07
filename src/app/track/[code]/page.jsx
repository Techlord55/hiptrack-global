// src/app/track/[code]/page.jsx
"use client";

import dynamic from 'next/dynamic'
import ShipmentBarcode from '@/components/ShipmentQRCode' // client component using 'react-barcode'

const MapLeaflet = dynamic(() => import('@/components/MapLeaflet'), { ssr: false })
const ShipmentDetails = dynamic(() => import('@/components/ShipmentDetails'), { ssr: false })

export default async function Page({ params }) {
    const code = params.code.toUpperCase()
    
    // FIX 2: Use the correct API endpoint: /api/tracking/[code]
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/tracking/${code}`)
    const shipment = await res.json()

    // FIX 3: Check for errors (e.g., 404 Not Found) before rendering
    if (res.status !== 200 || shipment.error) {
        return (
            <div className="max-w-6xl mx-auto p-6 text-center text-red-600 bg-white rounded-lg mt-10">
                <h1 className="text-xl font-bold">Tracking Error</h1>
                <p>Tracking code **{code}** not found or an error occurred.</p>
                <p className="text-sm text-gray-500">Details: {shipment.error || 'Server fetch failed.'}</p>
            </div>
        )
    }
  // server render core info and pass to client components for live behavior
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg">
      <ShipmentBarcode code={shipment.code} />
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold">Shipper Information</h3>
          <p>{shipment.shipper_name}</p>
          <p className="text-sm text-gray-600">{shipment.shipper_address}</p>
        </div>
        <div>
          <h3 className="font-bold">Receiver Information</h3>
          <p>{shipment.receiver_name}</p>
          <p className="text-sm text-gray-600">{shipment.receiver_address}</p>
        </div>
      </div>

      <ShipmentDetailsClient shipment={shipment} />
      <div className={`mt-6 p-3 text-center text-white ${shipment.status==='Arrived'?'bg-green-600':shipment.status==='In Transit'?'bg-blue-600':'bg-gray-600'}`}>
        SHIPMENT STATUS: {shipment.status.toUpperCase()}
      </div>
    </div>
  )
}
