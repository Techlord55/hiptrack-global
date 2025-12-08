"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Package, 
  User, 
  MapPin, 
  Clock, 
  CreditCard,
  Plus,
  X,
  Truck,
  Search
} from "lucide-react";

// You'll need to download cities.json from https://github.com/lutangar/cities.json
// and place it in your public folder

export default function AdminForm({ onSuccess }) {
  const [cities, setCities] = useState([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [originSearch, setOriginSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [form, setForm] = useState({
    name: "",
    agency: "",
    originCity: "",
    destCity: "",
    origin_lat: null,
    origin_lng: null,
    dest_lat: null,
    dest_lng: null,
    estimated_hours: "",
    shipper_name: "",
    shipper_phone: "",
    shipper_address: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_email: "",
    receiver_address: "",
    shipment_type: "Truckload",
    shipment_mode: "Land Shipping",
    carrier_ref: generateCarrierRef(),
    payment_mode: "CASH",
    admin_comment: "",
    status: "In Transit",
    location: ""
  });

  const [products, setProducts] = useState([
    { piece_type: "", description: "", qty: 1, length_cm: 0, width_cm: 0, height_cm: 0, weight_kg: 0 },
  ]);

  function generateCarrierRef() {
    return "LOG" + Math.floor(100000000000 + Math.random() * 900000000000);
  }

  // Load cities data
  useEffect(() => {
    if (!citiesLoaded) {
      fetch('/cities.json')
        .then(res => res.json())
        .then(data => {
          setCities(data);
          setCitiesLoaded(true);
        })
        .catch(err => {
          console.error('Failed to load cities:', err);
        });
    }
  }, [citiesLoaded]);

  // Filter cities based on search
  const filteredOriginCities = useMemo(() => {
    if (!originSearch || originSearch.length < 2) return [];
    const searchLower = originSearch.toLowerCase();
    return cities
      .filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.country.toLowerCase().includes(searchLower)
      )
      .slice(0, 50);
  }, [cities, originSearch]);

  const filteredDestCities = useMemo(() => {
    if (!destSearch || destSearch.length < 2) return [];
    const searchLower = destSearch.toLowerCase();
    return cities
      .filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.country.toLowerCase().includes(searchLower)
      )
      .slice(0, 50);
  }, [cities, destSearch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { piece_type: "", description: "", qty: 1, length_cm: 0, width_cm: 0, height_cm: 0, weight_kg: 0 },
    ]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const selectOriginCity = (city) => {
    setForm({ 
      ...form, 
      originCity: `${city.name}, ${city.country}`,
      origin_lat: parseFloat(city.lat),
      origin_lng: parseFloat(city.lng)
    });
    setOriginSearch(`${city.name}, ${city.country}`);
    setShowOriginDropdown(false);
  };

  const selectDestCity = (city) => {
    setForm({ 
      ...form, 
      destCity: `${city.name}, ${city.country}`,
      dest_lat: parseFloat(city.lat),
      dest_lng: parseFloat(city.lng)
    });
    setDestSearch(`${city.name}, ${city.country}`);
    setShowDestDropdown(false);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      products,
      current_lat: form.origin_lat,
      current_lng: form.origin_lng,
    };

    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to create shipment");
      return;
    }

    // Reset
    setForm({
      name: "",
      agency: "",
      originCity: "",
      destCity: "",
      origin_lat: null,
      origin_lng: null,
      dest_lat: null,
      dest_lng: null,
      estimated_hours: "",
      shipper_name: "",
      shipper_phone: "",
      shipper_address: "",
      receiver_name: "",
      receiver_phone: "",
      receiver_email: "",
      receiver_address: "",
      shipment_type: "Truckload",
      shipment_mode: "Land Shipping",
      carrier_ref: generateCarrierRef(),
      payment_mode: "CASH",
      admin_comment: "",
      status: "In Transit",
      location: ""
    });
    setOriginSearch("");
    setDestSearch("");
    setProducts([{ piece_type: "", description: "", qty: 1, length_cm: 0, width_cm: 0, height_cm: 0, weight_kg: 0 }]);

    onSuccess?.();
  };

  const statusColors = {
    "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-300",
    "In Transit": "bg-blue-100 text-blue-700 border-blue-300",
    "Delivered": "bg-green-100 text-green-700 border-green-300",
    "Cancelled": "bg-red-100 text-red-700 border-red-300",
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="space-y-8 p-6">
      
      {/* Shipment Details Section */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-500 p-2 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Shipment Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Shipment Name *</label>
            <input 
              className={inputClass} 
              name="name" 
              placeholder="e.g., Electronics Batch #123" 
              value={form.name} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className={labelClass}>Agency *</label>
            <input 
              className={inputClass} 
              name="agency" 
              placeholder="e.g., FedEx, DHL, UPS" 
              value={form.agency} 
              onChange={handleChange} 
            />
          </div>

          {/* Origin City with Search */}
          <div className="relative">
            <label className={labelClass}>
              <MapPin className="w-4 h-4 inline mr-1" />
              Origin City *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className={`${inputClass} pl-10`}
                type="text"
                placeholder="Type to search 130,000+ cities..."
                value={originSearch}
                onChange={(e) => {
                  setOriginSearch(e.target.value);
                  setShowOriginDropdown(true);
                }}
                onFocus={() => setShowOriginDropdown(true)}
              />
            </div>
            {showOriginDropdown && originSearch.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredOriginCities.length > 0 ? (
                  filteredOriginCities.map((city, idx) => (
                    <button
                      key={`${city.name}-${city.country}-${idx}`}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-purple-50 transition duration-150 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectOriginCity(city)}
                    >
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.country} • Lat: {city.lat}, Lng: {city.lng}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">No cities found. Try a different search.</div>
                )}
              </div>
            )}
          </div>

          {/* Destination City with Search */}
          <div className="relative">
            <label className={labelClass}>
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination City *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className={`${inputClass} pl-10`}
                type="text"
                placeholder="Type to search 130,000+ cities..."
                value={destSearch}
                onChange={(e) => {
                  setDestSearch(e.target.value);
                  setShowDestDropdown(true);
                }}
                onFocus={() => setShowDestDropdown(true)}
              />
            </div>
            {showDestDropdown && destSearch.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredDestCities.length > 0 ? (
                  filteredDestCities.map((city, idx) => (
                    <button
                      key={`${city.name}-${city.country}-${idx}`}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-purple-50 transition duration-150 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectDestCity(city)}
                    >
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.country} • Lat: {city.lat}, Lng: {city.lng}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">No cities found. Try a different search.</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              <Clock className="w-4 h-4 inline mr-1" />
              Estimated Hours *
            </label>
            <input 
              type="number" 
              className={inputClass} 
              name="estimated_hours" 
              placeholder="e.g., 48" 
              value={form.estimated_hours} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className={labelClass}>Shipment Type *</label>
            <select className={inputClass} name="shipment_type" value={form.shipment_type} onChange={handleChange}>
              <option>Truckload</option>
              <option>Less than Truckload (LTL)</option>
              <option>Air Freight</option>
              <option>Ocean Freight</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              <Truck className="w-4 h-4 inline mr-1" />
              Shipment Mode *
            </label>
            <select className={inputClass} name="shipment_mode" value={form.shipment_mode} onChange={handleChange}>
              <option>Land Shipping</option>
              <option>Air Shipping</option>
              <option>Sea Shipping</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              <CreditCard className="w-4 h-4 inline mr-1" />
              Payment Mode *
            </label>
            <select className={inputClass} name="payment_mode" value={form.payment_mode} onChange={handleChange}>
              <option>CASH</option>
              <option>CREDIT</option>
              <option>DEBIT</option>
              <option>ONLINE</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Carrier Reference No.</label>
            <input 
              className={`${inputClass} bg-gray-100`} 
              name="carrier_ref" 
              value={form.carrier_ref} 
              readOnly 
            />
          </div>

          <div>
            <label className={labelClass}>Initial Status *</label>
            <div className="flex gap-3 items-center">
              <select 
                className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500`} 
                name="status" 
                value={form.status} 
                onChange={handleChange} 
              >
                <option value="On Hold">On Hold</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${statusColors[form.status]}`}>
                {form.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipper Information */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500 p-2 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Shipper Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Shipper Name *</label>
            <input 
              className={inputClass} 
              name="shipper_name" 
              placeholder="Full name" 
              value={form.shipper_name} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className={labelClass}>Shipper Phone *</label>
            <input 
              className={inputClass} 
              name="shipper_phone" 
              placeholder="+1 234 567 8900" 
              value={form.shipper_phone} 
              onChange={handleChange} 
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Shipper Address *</label>
            <textarea 
              className={inputClass} 
              name="shipper_address" 
              placeholder="Full address with city, state, zip" 
              value={form.shipper_address} 
              onChange={handleChange} 
              rows="2"
            />
          </div>
        </div>
      </div>

      {/* Receiver Information */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-500 p-2 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Receiver Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Receiver Name *</label>
            <input 
              className={inputClass} 
              name="receiver_name" 
              placeholder="Full name" 
              value={form.receiver_name} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className={labelClass}>Receiver Phone *</label>
            <input 
              className={inputClass} 
              name="receiver_phone" 
              placeholder="+1 234 567 8900" 
              value={form.receiver_phone} 
              onChange={handleChange} 
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Receiver Email *</label>
            <input 
              type="email" 
              className={inputClass} 
              name="receiver_email" 
              placeholder="email@example.com" 
              value={form.receiver_email} 
              onChange={handleChange} 
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Receiver Address *</label>
            <textarea 
              className={inputClass} 
              name="receiver_address" 
              placeholder="Full address with city, state, zip" 
              value={form.receiver_address} 
              onChange={handleChange} 
              rows="2"
            />
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Products</h3>
          </div>
          <button 
            type="button" 
            onClick={addProduct} 
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        <div className="space-y-4">
          {products.map((p, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border-2 border-green-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700">Product #{idx + 1}</span>
                {products.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeProduct(idx)} 
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Piece Type *</label>
                  <input 
                    className={inputClass} 
                    placeholder="Box, Pallet, etc." 
                    value={p.piece_type} 
                    onChange={(e) => handleProductChange(idx, "piece_type", e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                  <input 
                    className={inputClass} 
                    placeholder="Product details" 
                    value={p.description} 
                    onChange={(e) => handleProductChange(idx, "description", e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity *</label>
                  <input 
                    type="number" 
                    className={inputClass} 
                    placeholder="Qty" 
                    value={p.qty} 
                    onChange={(e) => handleProductChange(idx, "qty", e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Weight (kg) *</label>
                  <input 
                    type="number" 
                    className={inputClass} 
                    placeholder="kg" 
                    value={p.weight_kg} 
                    onChange={(e) => handleProductChange(idx, "weight_kg", e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Length (cm) *</label>
                  <input 
                    type="number" 
                    className={inputClass} 
                    placeholder="cm" 
                    value={p.length_cm} 
                    onChange={(e) => handleProductChange(idx, "length_cm", e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Width (cm) *</label>
                  <input 
                    type="number" 
                    className={inputClass} 
                    placeholder="cm" 
                    value={p.width_cm} 
                    onChange={(e) => handleProductChange(idx, "width_cm", e.target.value)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Height (cm) *</label>
                  <input 
                    type="number" 
                    className={inputClass} 
                    placeholder="cm" 
                    value={p.height_cm} 
                    onChange={(e) => handleProductChange(idx, "height_cm", e.target.value)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Notes (Optional)</h3>
        <textarea 
          className={inputClass} 
          name="admin_comment" 
          placeholder="Internal notes, special instructions, etc..." 
          value={form.admin_comment} 
          onChange={handleChange} 
          rows="3"
        />
        <p className="text-sm text-gray-500 mt-2">These notes are for internal use and won't be sent to customers initially.</p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button 
          onClick={handleSubmit} 
          className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition duration-300 transform hover:scale-105 font-bold text-lg flex items-center gap-2"
        >
          <Package className="w-5 h-5" />
          Create Shipment
        </button>
      </div>

      {/* Loading Indicator */}
      {!citiesLoaded && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          Loading 130,000+ cities...
        </div>
      )}

      {citiesLoaded && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ Cities loaded successfully!
        </div>
      )}
    </div>
  );
}