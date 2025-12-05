"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AdminForm from "@/components/AdminForm";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipments();
  }, []);

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

  const updateLocation = async (code, lat, lng) => {
    try {
      await fetch("/api/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lat, lng }),
      });
      loadShipments();
    } catch (err) {
      console.error("Location update error:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Create Shipment</h2>
            <AdminForm onSuccess={loadShipments} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Active Shipments</h2>

            {loading ? (
              <p>Loading shipments...</p>
            ) : shipments.length === 0 ? (
              <p className="text-gray-500">No shipments yet.</p>
            ) : (
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div key={shipment.code} className="border p-4 rounded-lg">
                    <p className="font-bold text-lg">{shipment.name}</p>
                    <p className="text-sm text-gray-600">Code: {shipment.code}</p>
                    <p className="text-sm text-gray-600">Agency: {shipment.agency}</p>
                    <p className="text-sm text-gray-600">Products: {shipment.products}</p>
                    <p className="text-sm text-gray-600">
                      Current: {shipment.lat}, {shipment.lng}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <input
                        type="number"
                        step="0.000001"
                        id={`lat-${shipment.code}`}
                        className="border rounded px-3 py-2 flex-1"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        id={`lng-${shipment.code}`}
                        className="border rounded px-3 py-2 flex-1"
                        placeholder="Lng"
                      />
                      <button
                        onClick={() => {
                          const lat = parseFloat(
                            document.getElementById(`lat-${shipment.code}`).value
                          );
                          const lng = parseFloat(
                            document.getElementById(`lng-${shipment.code}`).value
                          );
                          if (!isNaN(lat) && !isNaN(lng)) {
                            updateLocation(shipment.code, lat, lng);
                          } else {
                            alert("Enter valid coordinates");
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
