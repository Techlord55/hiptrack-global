'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
// At the very top of your file
import { format } from 'date-fns'
import ShipmentHistory from "@/components/ShipmentHistory"
import ShipmentQRCode from "@/components/ShipmentQRCode";
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
  Navigation,
  DollarSign,
  Shield,
  Globe,
  FileText,
  Scale,
  Tag,
  CreditCard
} from 'lucide-react'

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

    const avgSpeed = traveledDistance / (hoursInTransit || 1)
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
          setPolling(false)
        }
      } catch (err) {
        console.error('Polling error', err)
      }
    }

    fetchShipment()
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

  // Check if international
  const isInternational = shipment.hs_code || shipment.incoterm

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Card */}
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
              <div className="flex gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} text-white font-semibold`}>
                  <Navigation className="w-4 h-4" />
                  {displayStatus}
                </span>
                {shipment.shipment_category && shipment.shipment_category !== 'General' && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    <Tag className="w-4 h-4" />
                    {shipment.shipment_category}
                  </span>
                )}
                {isInternational && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    <Globe className="w-4 h-4" />
                    International
                  </span>
                )}
              </div>
            </div>
          <div className="relative left-20 md:left-0">
  <ShipmentQRCode code={shipment.code} />
</div>

           
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

            {/* Client & Finance Info (if available) */}
            {(shipment.client_id || shipment.total_cost || shipment.insurance) && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shipment.client_id && (
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-100 p-3 rounded-xl">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Client ID</p>
                        <p className="text-lg font-bold text-gray-900">{shipment.client_id}</p>
                      </div>
                    </div>
                  </div>
                )}

                {shipment.total_cost && (
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-emerald-100 p-3 rounded-xl">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-lg font-bold text-gray-900">
                          {shipment.currency || 'USD'} {parseFloat(shipment.total_cost).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Status: {shipment.payment_status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {shipment.insurance && (
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Insurance</p>
                        <p className="text-lg font-bold text-gray-900">
                          {shipment.currency || 'USD'} {parseFloat(shipment.insurance_value || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">✓ Insured</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Weight & Handling Info */}
            {(shipment.total_weight || shipment.volumetric_weight || (shipment.special_handling && shipment.special_handling.length > 0)) && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-600" />
                  Weight & Handling Information
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {shipment.total_weight && (
                    <div className="p-4 bg-cyan-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Total Weight</p>
                      <p className="font-semibold text-cyan-600 text-xl">{parseFloat(shipment.total_weight).toFixed(2)} kg</p>
                    </div>
                  )}
                  {shipment.volumetric_weight && (
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Volumetric Weight</p>
                      <p className="font-semibold text-purple-600 text-xl">{parseFloat(shipment.volumetric_weight).toFixed(2)} kg</p>
                    </div>
                  )}
                  {shipment.total_weight && shipment.volumetric_weight && (
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Chargeable Weight</p>
                      <p className="font-semibold text-orange-600 text-xl">
                        {Math.max(parseFloat(shipment.total_weight), parseFloat(shipment.volumetric_weight)).toFixed(2)} kg
                      </p>
                    </div>
                  )}
                  {shipment.special_handling && shipment.special_handling.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-xl md:col-span-1">
                      <p className="text-xs text-gray-600 mb-2">Special Handling</p>
                      <div className="flex flex-wrap gap-1">
                        {shipment.special_handling.map((tag, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customs Info (if international) */}
            {isInternational && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl shadow-xl p-6 border border-amber-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  International Customs Information
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {shipment.hs_code && (
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">HS Code</p>
                      <p className="font-semibold text-gray-900">{shipment.hs_code}</p>
                    </div>
                  )}
                  {shipment.incoterm && (
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Incoterm</p>
                      <p className="font-semibold text-gray-900">{shipment.incoterm}</p>
                    </div>
                  )}
                  {shipment.country_of_manufacture && (
                    <div className="p-4 bg-white rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Country of Manufacture</p>
                      <p className="font-semibold text-gray-900">{shipment.country_of_manufacture}</p>
                    </div>
                  )}
                  {shipment.customs_declaration_description && (
                    <div className="p-4 bg-white rounded-xl md:col-span-3">
                      <p className="text-xs text-gray-600 mb-1">Customs Declaration</p>
                      <p className="text-sm text-gray-700">{shipment.customs_declaration_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                    {shipment.estimated_hours && (
                      <p className="text-xs text-gray-500">Target: {shipment.estimated_hours} hours</p>
                    )}
                  </div>
                </div>
              </div>
              

<div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
  <div className="flex items-center gap-3 mb-3">
    <div className="bg-blue-100 p-3 rounded-xl">
      <Clock className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600">Delivery Time</p>
      <p className="text-2xl font-bold text-gray-900">
        {shipment.delivery_datetime
          ? format(new Date(shipment.delivery_datetime), "yyyy-MM-dd HH:mm:ss 'UTC'")
          : 'Not set'}
      </p>
      {shipment.expected_delivery_datetime && (
        <p className="text-xs text-gray-500">
          Target: {format(new Date(shipment.expected_delivery_datetime), "yyyy-MM-dd HH:mm:ss 'UTC'")}
        </p>
      )}
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
                      {shipment.status !== 'Delivered' ? eta.time : 'Delivered'}
                    </p>
                    {shipment.expected_delivery_datetime && (
                      <p className="text-xs text-gray-500">
                        Expected: {new Date(shipment.expected_delivery_datetime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
               <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pickup Time</p>
                    <p className="text-lg font-bold text-gray-900">
                      {shipment.status !== 'Delivered' ? eta.time : 'Delivered'}
                    </p>
                    {shipment.expected_delivery_datetime && (
                      <p className="text-xs text-gray-500">
                        Expected: {new Date(shipment.pickup_datetime).toLocaleString()}
                      </p>
                    )}
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
                  {shipment.delivery_signature_required && (
                    <p className="text-xs text-purple-600 font-semibold mt-2">✓ Signature required on delivery</p>
                  )}
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
                  <p className="font-semibold text-gray-900">{fmt(shipment.shipper_address)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Carrier</p>
                  <p className="font-semibold text-gray-900">{fmt(shipment.agency)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Carrier Reference</p>
                  <p className="font-semibold text-gray-900">{fmt(shipment.carrier_ref)}</p>
                </div>
                {shipment.current_vehicle_id && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Vehicle ID</p>
                    <p className="font-semibold text-gray-900">{shipment.current_vehicle_id}</p>
                  </div>
                )}
                {shipment.current_driver_id && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Driver ID</p>
                    <p className="font-semibold text-gray-900">{shipment.current_driver_id}</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Payment Mode</p>
                  <p className="font-semibold text-gray-900">{fmt(shipment.payment_mode)}</p>
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
                       <th className="p-4 text-left font-semibold">Product</th>
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
                        <td className="p-4 text-gray-900">{fmt(p.product)}</td>
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
            
           

            {/* Tracking History */}
            {shipment.tracking_history && shipment.tracking_history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Tracking History
                </h4>
                <div className="space-y-4">
                  {shipment.tracking_history.map((event, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Timeline Line */}
                      {idx !== shipment.tracking_history.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-full bg-gradient-to-b from-purple-200 to-transparent"></div>
                      )}
                      
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center z-10">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Event Content */}
                      <div className="flex-1 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-gray-900">{event.event}</h5>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {event.location}
                        </p>
                        {event.reason && (
                          <p className="text-xs text-gray-600 mt-2 italic">{event.reason}</p>
                        )}
                        {event.status && (
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[event.status] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {event.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <ShipmentHistory  shipmentCode= {shipment.code}/>
              </div>
            )}

            {/* Transit Hubs */}
            {shipment.transit_hubs && shipment.transit_hubs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-purple-600" />
                  Transit Hubs
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {shipment.transit_hubs.map((hub, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="font-semibold text-purple-900">{hub.name || `Hub ${idx + 1}`}</p>
                      <p className="text-sm text-purple-700 mt-1">{hub.location}</p>
                      {hub.timestamp && (
                        <p className="text-xs text-purple-600 mt-2">
                          {new Date(hub.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {shipment.customs_docs && shipment.customs_docs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Customs Documents
                </h4>
                <div className="space-y-2">
                  {shipment.customs_docs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900 font-medium">{doc.name || `Document ${idx + 1}`}</span>
                      </div>
                      {doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          View →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notify Me Tab */}
        {!isAdmin && activeTab === 'notify' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block bg-purple-100 p-4 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Delivery Notifications</h2>
                <p className="text-gray-600">
                  Enter your email to receive updates about this shipment
                </p>
              </div>

              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Subscribe to Updates
                </button>
              </form>

              {notifyMessage && (
                <div className={`mt-4 p-4 rounded-lg ${
                  notifyMessage.includes('submitted') || notifyMessage.includes('success')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {notifyMessage}
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You'll receive email notifications when your shipment status changes or when it's out for delivery.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const statusColors = {
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "In Transit": "bg-blue-100 text-blue-700 border-blue-300",
  "Delivered": "bg-green-100 text-green-700 border-green-300",
  "Cancelled": "bg-red-100 text-red-700 border-red-300",
}