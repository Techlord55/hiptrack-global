'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { 
  Clock, 
  Calendar, 
  Package, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Truck,
  AlertCircle,
  TrendingUp,
  Navigation
} from 'lucide-react'

import ShipmentQRCode from './ShipmentQRCode'

import ShipmentHistory from './ShipmentHistory'
// Client-only map
const MapLeaflet = dynamic(() => import('./MapLeaflet'), { ssr: false })

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function ShipmentDetails({ initialShipment, isAdmin = false }) {
  const [shipment, setShipment] = useState(initialShipment ?? null)
  const [location, setLocation] = useState({
    lat: initialShipment?.current_lat ?? null,
    lng: initialShipment?.current_lng ?? null,
  })
  const [activeTab, setActiveTab] = useState('details')
  const [email, setEmail] = useState('')
  const [notifyMessage, setNotifyMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [polling, setPolling] = useState(true)
  const mounted = useRef(false)
  const pollingIntervalRef = useRef(null)

  const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : v)

  const calculatedProgress = useMemo(() => {
    const originLat = shipment?.origin_lat ?? initialShipment?.current_lat
    const originLng = shipment?.origin_lng ?? initialShipment?.current_lng

    if (!originLat || !originLng || !shipment?.dest_lat || !shipment?.dest_lng || !location.lat || !location.lng) {
      return shipment?.progress ?? 0
    }

    const totalDistance = calculateDistance(originLat, originLng, shipment.dest_lat, shipment.dest_lng)
    const traveledDistance = calculateDistance(originLat, originLng, location.lat, location.lng)
    const progressPct = totalDistance > 0 ? traveledDistance / totalDistance : 0

    return Math.min(1, Math.max(progressPct, 0))
  }, [shipment, location, initialShipment])

  const eta = useMemo(() => {
  if (!shipment?.created_at || !location.lat || !location.lng) {
    return { time: 'Calculating...', hours: 'N/A' }
  }

  const originLat = shipment.origin_lat
  const originLng = shipment.origin_lng
  const destLat = shipment.dest_lat
  const destLng = shipment.dest_lng

  const totalDistance = calculateDistance(originLat, originLng, destLat, destLng)
  const traveledDistance = calculateDistance(originLat, originLng, location.lat, location.lng)
  const remainingDistance = Math.max(0, totalDistance - traveledDistance)

  const hoursInTransit =
    (Date.now() - new Date(shipment.created_at).getTime()) / (1000 * 60 * 60)

  const avgSpeed = traveledDistance / (hoursInTransit || 1) // km/h
  const etaHours = remainingDistance / (avgSpeed || 1)

  const arrivalTime = new Date(Date.now() + etaHours * 3600000)

  return {
    hours: etaHours.toFixed(1),
    time: arrivalTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}, [shipment, location])

useEffect(() => {
  if (!initialShipment?.code) return
  mounted.current = true

  const fetchShipment = async () => {
    try {
      const res = await fetch(`/api/tracking/${initialShipment.code}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (!mounted.current) return

      setShipment(data)

      const statusStopsMovement = ['On Hold', 'Cancelled', 'Delivered'].includes(data.status)

      if (!statusStopsMovement) {
        // Only simulate movement if shipment allowed to move
        await fetch('/api/shipments/simulate-movement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: initialShipment.code }),
        })

        setLocation({
          lat: data.current_lat ?? null,
          lng: data.current_lng ?? null
        })
      } else {
        // Stop polling completely
        setPolling(false)
      }
    } catch (err) {
      console.error('Polling error', err)
    }
  }

  // First fetch
  fetchShipment()

  // Start interval only once
  pollingIntervalRef.current = setInterval(() => {
    if (polling) fetchShipment()
  }, 3000)

  return () => {
    mounted.current = false
    clearInterval(pollingIntervalRef.current)
    pollingIntervalRef.current = null
  }
}, [initialShipment?.code, polling])


  const handleNotifySubmit = async (e) => {
    e.preventDefault()
    if (!email) return setNotifyMessage('Please enter your email')
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, shipmentCode: shipment?.code }),
      })
      const data = await res.json()
      setNotifyMessage(data.message || 'Notification request submitted!')
    } catch {
      setNotifyMessage('Something went wrong')
    }
  }

  if (!shipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading tracking details...</p>
        </div>
      </div>
    )
  }

  const displayStatus = shipment.status === 'On Hold' ? 'Stopped' : shipment.status
  const progressPct = Math.min(100, Math.round(calculatedProgress * 100))
  
  const getStatusConfig = (status) => {
    const configs = {
      'Delivered': { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-200', gradient: 'from-green-50 to-green-100' },
      'On Hold': { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200', gradient: 'from-yellow-50 to-yellow-100' },
      'Cancelled': { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200', gradient: 'from-red-50 to-red-100' },
      'In Transit': { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-50 to-blue-100' },
    }
    return configs[status] || { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200', gradient: 'from-gray-50 to-gray-100' }
  }

  const statusConfig = getStatusConfig(shipment.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Card with QR */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{shipment.name}</h1>
                  <p className="text-sm text-gray-600">Tracking Code: <span className="font-semibold text-purple-600">{shipment.code}</span></p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} text-white font-semibold`}>
                <Navigation className="w-4 h-4" />
                {displayStatus}
              </div>
            </div>
            <ShipmentQRCode code={shipment.code} />
            
          </div>
        </div>

        {/* Tabs */}
        {!isAdmin && (
          <div className="bg-white rounded-2xl shadow-xl mb-6 border border-gray-100 overflow-hidden">
            <div className="flex">
              <button
                className={`flex-1 p-4 font-semibold transition duration-200 ${
                  activeTab === 'details'
                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('details')}
              >
                <Package className="w-5 h-5 inline mr-2" />
                Details
              </button>
              <button
                className={`flex-1 p-4 font-semibold transition duration-200 ${
                  activeTab === 'notify'
                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('notify')}
              >
                <Mail className="w-5 h-5 inline mr-2" />
                Notify Me
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {((!isAdmin && activeTab === 'details') || isAdmin) && (
          <div className="space-y-6">
            
            {/* Progress Overview */}
            <div className={`bg-gradient-to-r ${statusConfig.gradient} rounded-2xl shadow-xl p-6 border ${statusConfig.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Shipment Progress
                </h3>
                <span className={`text-2xl font-bold ${statusConfig.text}`}>{progressPct}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-6 overflow-hidden shadow-inner">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${statusConfig.bg} flex items-center justify-end pr-2`}
                  style={{ width: `${progressPct}%` }}
                >
                  {progressPct > 10 && <span className="text-white text-xs font-semibold">{progressPct}%</span>}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Last updated: {shipment.updated_at ? new Date(shipment.updated_at).toLocaleString() : '—'}</p>
            </div>

            {/* ETA Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Travel Time</p>
                    <p className="text-2xl font-bold text-gray-900">{eta.hours} Hours</p>
                        
                  </div>
                  <div>
                     <p className="text-sm text-gray-600"> Travel Time</p>
                    <p className="text-2xl font-bold text-gray-900">{shipment.estimated_hours} Hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Arrival</p>
                    <p className="text-lg font-bold text-gray-900">
                      {shipment.status !== 'Delivered' ? eta.time : 'Arrived at Final Port'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipper & Receiver Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Shipper Information</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-900 font-semibold">{fmt(shipment.shipper_name)}</p>
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {fmt(shipment.shipper_address)}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {fmt(shipment.shipper_phone)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Receiver Information</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-900 font-semibold">{fmt(shipment.receiver_name)}</p>
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {fmt(shipment.receiver_address)}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {fmt(shipment.receiver_phone)}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {fmt(shipment.receiver_email)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipment Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Shipment Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Origin</p>
                  <p className="font-semibold text-gray-900">{fmt(shipment.location)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Carrier</p>
                  <p className="font-semibold text-gray-900">{fmt(shipment.agency)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Carrier Reference</p>
                  <p className="font-semibold text-gray-900">{fmt(shipment.carrier_ref)}</p>
                </div>
              </div>
            </div>

            {/* Admin Comment */}
            {shipment.admin_comment && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">Important Notice from Administration</h4>
                    <p className="text-red-800 whitespace-pre-line leading-relaxed">{shipment.admin_comment}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Packages Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Package Details
              </h4>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-orange-500 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold">Qty</th>
                      <th className="p-4 text-left font-semibold">Type</th>
                      <th className="p-4 text-left font-semibold">Description</th>
                      <th className="p-4 text-left font-semibold">Dimensions (cm)</th>
                      <th className="p-4 text-left font-semibold">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipment.products?.map((p, idx) => (
                      <tr key={idx} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition`}>
                        <td className="p-4 text-gray-900 font-semibold">{fmt(p.qty)}</td>
                        <td className="p-4 text-gray-900">{fmt(p.piece_type)}</td>
                        <td className="p-4 text-gray-900">{fmt(p.description)}</td>
                        <td className="p-4 text-gray-900">{fmt(p.length_cm)} × {fmt(p.width_cm)} × {fmt(p.height_cm)}</td>
                        <td className="p-4 text-gray-900 font-semibold">{fmt(p.weight_kg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Live Tracking Map
              </h4>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
                <MapLeaflet
                  lat={location.lat}
                  lng={location.lng}
                  originLat={shipment.origin_lat ?? initialShipment?.current_lat}
                  originLng={shipment.origin_lng ?? initialShipment?.current_lng}
                  destLat={shipment.dest_lat}
                  destLng={shipment.dest_lng}
                  status={shipment.status}
                />
              </div>
            </div>

            {/* Admin Controls - Placeholder */}
            {isAdmin && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="font-bold text-lg text-gray-900 mb-4">Admin Controls</h4>
                <p className="text-gray-600 text-sm">Admin controls component would go here (ShipmentAdminControls, ShipmentEdit, etc.)</p>
              </div>
            )}

          {/* Shipment History */}
            <ShipmentHistory shipmentCode={shipment.code} />
          </div>
        )}

        {/* Notify Me Tab */}
        {!isAdmin && activeTab === 'notify' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Get Delivery Notifications</h3>
                <p className="text-sm text-gray-600">We'll notify you when your shipment is delivered</p>
              </div>
            </div>
            <form onSubmit={handleNotifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-4 rounded-xl hover:shadow-xl transition duration-300 font-bold text-lg"
              >
                Notify Me When Delivered
              </button>
            </form>
            {notifyMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {notifyMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}