"use client";

import { useEffect, useState } from "react";

export default function UpdateLocation() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shipments");
      const data = await res.json();
      setShipments(data);
    } catch (err) {
      console.error("Error loading shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const updateLocation = async (code, lat, lng) => {
    try {
      const res = await fetch("/api/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lat, lng }),
      });
      const result = await res.json();
      if (res.ok) {
        alert(`Location updated for ${code}`);
        loadShipments(); // Refresh list
      } else {
        alert(result.error || "Failed to update location");
      }
    } catch (err) {
      console.error("Error updating location:", err);
      alert("Failed to update location");
    }
  };

  if (loading) return <p>Loading shipments...</p>;
  if (!shipments.length) return <p>No shipments to update.</p>;

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <div key={shipment.code} className="border p-4 rounded-lg">
          <p className="font-bold">{shipment.name}</p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              step="0.000001"
              id={`lat-${shipment.code}`}
              placeholder="Lat"
              className="border rounded px-2 py-1 flex-1"
            />
            <input
              type="number"
              step="0.000001"
              id={`lng-${shipment.code}`}
              placeholder="Lng"
              className="border rounded px-2 py-1 flex-1"
            />
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              onClick={() => {
                const lat = parseFloat(document.getElementById(`lat-${shipment.code}`).value);
                const lng = parseFloat(document.getElementById(`lng-${shipment.code}`).value);
                if (!isNaN(lat) && !isNaN(lng)) {
                  updateLocation(shipment.code, lat, lng);
                } else {
                  alert("Enter valid coordinates");
                }
              }}
            >
              Update
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
