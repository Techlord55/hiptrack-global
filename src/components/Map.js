'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function Map({ lat, lng }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current) {
      const map = L.map(mapRef.current).setView([lat, lng], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup('Current Location')
        .openPopup()

      return () => map.remove()
    }
  }, [lat, lng])

  return <div ref={mapRef} className="w-full h-96" />
}
