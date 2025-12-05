"use client";

import { useEffect, useState } from "react";

export default function ShipmentsList() {
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

  if (loading) return <p>Loading shipments...</p>;
  if (!shipments.length) return <p>No shipments yet.</p>;

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => (
        <div key={shipment.code} className="border p-4 rounded-lg">
          <p className="font-bold text-lg">{shipment.name}</p>
          <p className="text-sm text-gray-600">Code: {shipment.code}</p>
          <p className="text-sm text-gray-600">
            Current: {shipment.current_lat}, {shipment.current_lng}
          </p>
          <p className="text-sm text-gray-600">Agency: {shipment.agency}</p>
          <p className="text-sm text-gray-600">Products: {shipment.products}</p>
        </div>
      ))}
    </div>
  );
}
