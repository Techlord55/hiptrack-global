'use client'
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure you import the Leaflet CSS

import 'leaflet-pulse-icon'
// Fix for default Leaflet marker icons not appearing in Webpack/Next.js builds
// If you see a blue square instead of a marker, this is needed.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Default fallback coordinates (e.g., center of the US)
const DEFAULT_CENTER_LAT = 39.8283; 
const DEFAULT_CENTER_LNG = -98.5795; 

// Custom Icon for the moving ship
const shipIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3208/3208358.png', // A generic ship icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
});

// Helper to ensure coordinate is a valid float
const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
};

export default function MapLeaflet({ lat, lng, destLat, destLng, originLat, originLng }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null); // Ref for the moving marker
    const routeRef = useRef(null); // Ref for the route polyline

    // Parse all incoming coordinates to ensure they are valid numbers
    const currentLat = safeParseFloat(lat);
    const currentLng = safeParseFloat(lng);
    const destinationLat = safeParseFloat(destLat);
    const destinationLng = safeParseFloat(destLng);
    const startLat = safeParseFloat(originLat);
    const startLng = safeParseFloat(originLng);

    // Initial Map Setup (Runs Once)
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            
            // Determine the best center for the initial view
            const centerLat = currentLat || startLat || destinationLat || DEFAULT_CENTER_LAT;
            const centerLng = currentLng || startLng || destinationLng || DEFAULT_CENTER_LNG;
            
            // 1. Create map instance
            const map = L.map(mapRef.current).setView([centerLat, centerLng], 4);
            mapInstanceRef.current = map;

            // Add Tile Layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // 2. Add the initial (moving) marker
            if (currentLat && currentLng) {
                const marker = L.marker([currentLat, currentLng], { icon: shipIcon }).addTo(map);
                markerRef.current = marker;
            } else {
                // If no current location, create a placeholder marker at the center
                const marker = L.marker([centerLat, centerLng], { icon: shipIcon }).addTo(map).bindPopup("Current Location Unknown/Default");
                markerRef.current = marker;
            }

            // 3. Draw Initial Route Line
            const initialRoute = L.polyline([], { color: '#0f76e6', weight: 4, opacity: 0.8 }).addTo(map);
            routeRef.current = initialRoute;
            
            // 4. Draw Destination Marker
            if (destinationLat && destinationLng) {
                L.marker([destinationLat, destinationLng], {
                    icon: L.icon.pulse({ // You might need to install 'leaflet-pulse-icon' for this, or use L.marker
                        iconSize: [20, 20],
                        color: 'red',
                        fillColor: 'red'
                    })
                }).addTo(map).bindPopup("Final Destination").openPopup();
            }

            // Fit bounds to show the entire route
            const bounds = [];
            if (startLat && startLng) bounds.push([startLat, startLng]);
            if (destinationLat && destinationLng) bounds.push([destinationLat, destinationLng]);
            
            if (bounds.length > 1) {
                map.fitBounds(bounds, { padding: [50, 50] }); 
            } else if (bounds.length === 1) {
                map.setView(bounds[0], 8);
            }

        }
    }, [startLat, startLng, destinationLat, destinationLng]); // Dependencies only for initial setup

    
    // Continuous Update Logic (Runs on every location change)
    useEffect(() => {
        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        const route = routeRef.current;

        if (map && marker && route && currentLat !== null && currentLng !== null) {
            const newLatLng = L.latLng(currentLat, currentLng);
            
            // 1. Move the marker to the new coordinates
            marker.setLatLng(newLatLng).bindPopup("Ship is Here").openPopup();
            
            // 2. Update the Route Line
            const routeCoordinates = [];
            
            // A. Start point (Origin)
            if (startLat !== null && startLng !== null) {
                routeCoordinates.push(L.latLng(startLat, startLng));
            }
            
            // B. Current Location
            routeCoordinates.push(newLatLng);
            
            // C. End point (Destination)
            if (destinationLat !== null && destinationLng !== null) {
                routeCoordinates.push(L.latLng(destinationLat, destinationLng));
            }

            // Update the polyline
            route.setLatLngs(routeCoordinates);
        }

    }, [currentLat, currentLng, startLat, startLng, destinationLat, destinationLng]); // Runs when current location updates

    return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '0 0 12px 12px' }} />;
}