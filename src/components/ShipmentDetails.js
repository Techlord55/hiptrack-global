'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

// Client-only map
const MapLeaflet = dynamic(() => import('./MapLeaflet'), { ssr: false })

export default function ShipmentDetails({ shipment }) {
  const [currentLat, setCurrentLat] = useState(shipment.current_lat)
  const [currentLng, setCurrentLng] = useState(shipment.current_lng)
  const [progress, setProgress] = useState(shipment.progress ?? 0)
  const [activeTab, setActiveTab] = useState('details')
  const [email, setEmail] = useState('')
  const [notifyMessage, setNotifyMessage] = useState('')

  // Poll backend for current coordinates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tracking/${shipment.code}`)
        const data = await res.json()
        if (data.current_lat && data.current_lng) {
          setCurrentLat(data.current_lat)
          setCurrentLng(data.current_lng)
          setProgress(data.progress)
          console.log(
            `Progress: ${(data.progress * 100).toFixed(2)}%, Lat: ${data.current_lat}, Lng: ${data.current_lng}`
          )
        }
      } catch (err) {
        console.error('Error fetching tracking data:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [shipment.code])

  // Calculate ETA
  const calculateEta = () => {
    if (!shipment.created_at || !shipment.estimated_hours) return { time: 'N/A', hours: 'N/A' }
    const startTime = new Date(shipment.created_at)
    const arrivalTime = new Date(startTime.getTime() + shipment.estimated_hours * 60 * 60 * 1000)
    const formattedArrival = arrivalTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    return { time: formattedArrival, hours: shipment.estimated_hours }
  }

  const eta = calculateEta()

  // Handle notify form submit
  const handleNotifySubmit = async (e) => {
    e.preventDefault()
    if (!email) return setNotifyMessage('Please enter your email')
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, shipmentCode: shipment.code }),
      })
      const data = await res.json()
      setNotifyMessage(data.message || 'Notification request submitted!')
    } catch (err) {
      console.error(err)
      setNotifyMessage('Something went wrong')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tab Menu */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 p-3 font-semibold ${
            activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`flex-1 p-3 font-semibold ${
            activeTab === 'notify' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('notify')}
        >
          Notify Me
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-1 bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" /> Estimated Travel Time
                </p>
                <p className="font-bold text-lg text-green-700">{eta.hours} Hours</p>
              </div>
              <div className="md:col-span-2 bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" /> Estimated Arrival
                </p>
                <p className="font-bold text-lg text-green-700">{eta.time}</p>
              </div>

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

            {/* Live Map */}
            <div className="h-96">
              <MapLeaflet
                lat={currentLat}
                lng={currentLng}
                originLat={shipment.current_lat}
                originLng={shipment.current_lng}
                destLat={shipment.dest_lat}
                destLng={shipment.dest_lng}
              />
            </div>

            <p className="mt-3 font-semibold">Progress: {(progress * 100).toFixed(2)}%</p>
          </>
        )}

        {activeTab === 'notify' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">Notify Me When Delivered</h3>
            <form onSubmit={handleNotifySubmit} className="flex flex-col md:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="p-2 border rounded-md flex-1"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Notify Me
              </button>
            </form>
            {notifyMessage && <p className="mt-2 text-sm text-blue-700">{notifyMessage}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
