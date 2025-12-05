'use client'
import { useState } from 'react'
import { PlusCircleIcon, MapPinIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'
import Select from 'react-select'
import { cities } from '@/lib/cities'

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm placeholder-gray-500"

// Dropdown data
const cityOptions = cities.map(city => ({
  value: {
    lat: city.lat,
    lng: city.lng,
    location: `${city.name}, ${city.country}`
  },
  label: `${city.name}, ${city.country}`
}));

export default function AdminForm({ onSuccess }) {

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    origin_location: '',
    products: '',
    agency: '',
    origin_lat: '',
    origin_lng: '',
    dest_lat: '',
    dest_lng: '',
    estimated_hours: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ORIGIN Select handler
  const handleOriginCityChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      origin_lat: selected?.value.lat.toString() || '',
      origin_lng: selected?.value.lng.toString() || '',
      origin_location: selected?.value.location || ''
    }))
  }

  // DESTINATION Select handler
  const handleDestCityChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      dest_lat: selected?.value.lat.toString() || '',
      dest_lng: selected?.value.lng.toString() || '',
      location: selected?.value.location || ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name.trim() ||
        !formData.location.trim() ||
        !formData.origin_location.trim() ||
        !formData.estimated_hours.trim()) {
      alert('Please fill in Customer Name, Origin City, Destination City, and Estimated Delivery Hours.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Shipment created! Tracking code: ${data.code}`)
        setFormData({
          name: '',
          location: '',
          origin_location: '',
          products: '',
          agency: '',
          origin_lat: '',
          origin_lng: '',
          dest_lat: '',
          dest_lng: '',
          estimated_hours: '',
        })
        onSuccess()
      } else {
        alert(data.error || 'Server error')
      }

    } catch (err) {
      alert('Unexpected error while submitting.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <PlusCircleIcon className="w-6 h-6 mr-2 text-indigo-600" />
        Create New Shipment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CUSTOMER INFO */}
        <fieldset className="border border-gray-200 p-5 rounded-lg">
          <legend className="text-lg font-semibold text-gray-700 px-2 flex items-center">
            <UserIcon className="w-5 h-5 mr-1 text-teal-500" />
            Customer & Products
          </legend>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Customer Name *
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Jane Doe"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Products (Optional)
            </label>
            <input
              name="products"
              value={formData.products}
              onChange={handleChange}
              placeholder="Laptop, Monitor..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Agency (Optional)
            </label>
            <input
              name="agency"
              value={formData.agency}
              onChange={handleChange}
              placeholder="DHL Express"
              className={inputClass}
            />
          </div>
        </fieldset>

        {/* ROUTE INFO */}
        <fieldset className="border border-gray-200 p-5 rounded-lg">
          <legend className="text-lg font-semibold text-gray-700 px-2 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-1 text-teal-500" />
            Route Planning
          </legend>

          {/* Origin */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Starting City *
            </label>
            <Select
              instanceId="origin-city"
              options={cityOptions}
              value={cityOptions.find(op => op.value.location === formData.origin_location) || null}
              onChange={handleOriginCityChange}
              placeholder="Search for Origin City..."
              className="w-full"
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              isClearable
            />
          </div>

          {/* Destination */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Destination City *
            </label>
            <Select
              instanceId="destination-city"
              options={cityOptions}
              value={cityOptions.find(op => op.value.location === formData.location) || null}
              onChange={handleDestCityChange}
              placeholder="Search for Destination City..."
              className="w-full"
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              isClearable
            />
          </div>

          {/* Hours */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
              Estimated Delivery Hours *
            </label>
            <input
              type="number"
              name="estimated_hours"
              min="1"
              value={formData.estimated_hours}
              onChange={handleChange}
              placeholder="72"
              className={inputClass}
            />
          </div>
        </fieldset>

        {/* Submit */}
        <button
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
        >
          {loading ? "Creating..." : "Create Shipment"}
        </button>

        <p className="text-xs text-right text-gray-500 mt-2">* Required fields</p>
      </form>
    </div>
  )
}
