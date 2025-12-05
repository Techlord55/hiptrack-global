'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-pulse-icon'

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Default fallback coordinates
const DEFAULT_CENTER_LAT = 39.8283
const DEFAULT_CENTER_LNG = -98.5795

// Ship icon
const shipIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3208/3208358.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
})

const safeParseFloat = (val) => {
  const parsed = parseFloat(val)
  return isNaN(parsed) ? null : parsed
}

export default function MapLeaflet({ lat, lng, originLat, originLng, destLat, destLng }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const routeRef = useRef(null)
  const animationRef = useRef(null)

  const currentLat = safeParseFloat(lat)
  const currentLng = safeParseFloat(lng)
  const startLat = safeParseFloat(originLat)
  const startLng = safeParseFloat(originLng)
  const destinationLat = safeParseFloat(destLat)
  const destinationLng = safeParseFloat(destLng)

  // Initial map setup
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const centerLat = currentLat || startLat || destinationLat || DEFAULT_CENTER_LAT
      const centerLng = currentLng || startLng || destinationLng || DEFAULT_CENTER_LNG

      const map = L.map(mapRef.current).setView([centerLat, centerLng], 4)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      // Marker for current location
      const marker = L.marker([currentLat || centerLat, currentLng || centerLng], { icon: shipIcon })
        .addTo(map)
        .bindPopup('Current Location')
      markerRef.current = marker

      // Polyline from origin → current
      const initialRoute = L.polyline([[startLat, startLng], [currentLat || startLat, currentLng || startLng]], {
        color: '#0f76e6',
        weight: 4,
        opacity: 0.8,
      }).addTo(map)
      routeRef.current = initialRoute

      // Destination marker (pulse)
      if (destinationLat && destinationLng) {
        L.marker([destinationLat, destinationLng], {
          icon: L.icon.pulse({
            iconSize: [20, 20],
            color: 'red',
            fillColor: 'red',
          }),
        })
          .addTo(map)
          .bindPopup('Destination')
      }

      // Fit map to bounds
      const bounds = []
      if (startLat && startLng) bounds.push([startLat, startLng])
      if (destinationLat && destinationLng) bounds.push([destinationLat, destinationLng])
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [50, 50] })
      else if (bounds.length === 1) map.setView(bounds[0], 8)
    }
  }, [startLat, startLng, destinationLat, destinationLng, currentLat, currentLng])

  // Animate marker to new coordinates
  const animateMarker = (marker, fromLatLng, toLatLng, duration = 2000) => {
    const startTime = performance.now()

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const lat = fromLatLng.lat + (toLatLng.lat - fromLatLng.lat) * progress
      const lng = fromLatLng.lng + (toLatLng.lng - fromLatLng.lng) * progress
      marker.setLatLng([lat, lng])

      // Update route polyline (origin → current marker)
      routeRef.current.setLatLngs([[startLat, startLng], [lat, lng]])

      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(animate)
  }

  // Update marker when coordinates change
  useEffect(() => {
    const marker = markerRef.current
    if (!marker || currentLat === null || currentLng === null) return

    const fromLatLng = marker.getLatLng()
    const toLatLng = L.latLng(currentLat, currentLng)
    animateMarker(marker, fromLatLng, toLatLng)
  }, [currentLat, currentLng, startLat, startLng])

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '0 0 12px 12px' }} />
}
