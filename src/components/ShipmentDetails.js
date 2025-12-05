'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

// Client-only map
const MapLeaflet = dynamic(() => import('./MapLeaflet'), { ssr: false })

export default function ShipmentDetails({ shipment }) {
  const [location, setLocation] = useState({
    lat: shipment.current_lat, // Use current_lat/lng from DB
    lng: shipment.current_lng
  })

    // 🔑 ETA Calculation Logic
    const calculateEta = () => {
        if (!shipment.created_at || !shipment.estimated_hours) {
            return { time: 'N/A', hours: 'N/A' };
        }
        
        const startTime = new Date(shipment.created_at);
        // Add hours to the start time (hours * minutes * seconds * milliseconds)
        const arrivalTime = new Date(startTime.getTime() + shipment.estimated_hours * 60 * 60 * 1000); 

        const formattedArrival = arrivalTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return { time: formattedArrival, hours: shipment.estimated_hours };
    }

    const eta = calculateEta();

  // Auto-refresh location every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tracking/${shipment.code}`)
        const data = await res.json()
// 🔑 NEW CONSOLE LOG for received data
        console.log('Frontend received new coordinates:', data.lat, data.lng);
        // Assuming the tracking API returns the current location
        if (data?.lat && data?.lng) {
          setLocation({
            lat: data.lat,
            lng: data.lng
          })
        }
      } catch (err) {
        console.error('Location update failed:', err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [shipment.code])

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

      {/* Details Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Shipment Details</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
            
            {/* 🔑 NEW: ETA DISPLAY */}
            <div className="md:col-span-1 bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 flex items-center"><ClockIcon className="w-4 h-4 mr-1"/> Estimated Travel Time</p>
                <p className="font-bold text-lg text-green-700">{eta.hours} Hours</p>
            </div>
            <div className="md:col-span-2 bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 flex items-center"><CalendarIcon className="w-4 h-4 mr-1"/> Estimated Arrival</p>
                <p className="font-bold text-lg text-green-700">{eta.time}</p>
            </div>

            {/* Existing Fields */}
          <div>
            <p className="text-sm text-gray-600">Customer Name</p>
            <p className="font-semibold">{shipment.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Tracking Code</p>
            <p className="font-semibold">{shipment.code}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Destination</p>
            <p className="font-semibold">{shipment.location}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Delivery Agency</p>
            <p className="font-semibold">{shipment.agency}</p>
          </div>

          <div className="md:col-span-3">
            <p className="text-sm text-gray-600">Products</p>
            <p className="font-semibold">{shipment.products}</p>
          </div>
        </div>
      </div>

      {/* Live Map */}
    {/* Live Map */}
      <div className="h-96">
        <MapLeaflet 
            lat={location.lat} // This is the moving coordinate
            lng={location.lng} // This is the moving coordinate
            originLat={shipment.current_lat} // This is the starting point (static)
            originLng={shipment.current_lng} // This is the starting point (static)
            destLat={shipment.dest_lat} // This is the endpoint (static)
            destLng={shipment.dest_lng} // This is the endpoint (static)
        />
        </div>
    </div>
  )
}