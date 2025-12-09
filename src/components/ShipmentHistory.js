'use client'

import { useState, useEffect } from 'react';
import { History, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ShipmentHistory({ shipmentCode }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!shipmentCode) return;

        async function fetchHistory() {
            try {
                const res = await fetch(`/api/history/${shipmentCode}`); 
                const data = await res.json();

                if (!res.ok || data.error) {
                    throw new Error(data.error || 'Failed to fetch history');
                }

                setHistory(data.history || []);
            } catch (err) {
                console.error('History fetch error:', err);
                setError('Could not load history.');
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [shipmentCode]);

    const getStatusIcon = (status) => {
        const icons = {
            'Delivered': <CheckCircle className="w-5 h-5 text-green-600" />,
            'In Transit': <MapPin className="w-5 h-5 text-blue-600" />,
            'On Hold': <AlertCircle className="w-5 h-5 text-yellow-600" />,
            'Cancelled': <AlertCircle className="w-5 h-5 text-red-600" />,
        };
        return icons[status] || <Clock className="w-5 h-5 text-gray-600" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            'Delivered': 'bg-green-100 text-green-800 border-green-200',
            'In Transit': 'bg-blue-100 text-blue-800 border-blue-200',
            'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                    <p className="ml-3 text-gray-600">Loading history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
                <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-6 h-6" />
                    <p className="font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No history available for this shipment yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                    <History className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Shipment History</h3>
            </div>

            {/* Timeline View */}
            <div className="space-y-4">
                {history.map((item, index) => (
                    <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-0 -translate-x-1/2 bg-white border-4 border-purple-500 rounded-full w-4 h-4"></div>
                        
                        <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition duration-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.timestamp).toLocaleString('en-US', { 
                                                dateStyle: 'medium', 
                                                timeStyle: 'short' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {item.location && (
                                <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                                    <span className="font-medium">{item.location}</span>
                                </div>
                            )}

                            {item.remarks && (
                                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <p className="text-sm text-gray-700 leading-relaxed">{item.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
 <div className='h-1'></div>
            {/* Alternative: Table View (commented out, can be toggled) */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-orange-500 text-white">
                        <tr>
                            <th className="p-4 text-left font-semibold">Date & Time</th>
                            <th className="p-4 text-left font-semibold">Location</th>
                            <th className="p-4 text-left font-semibold">Status</th>
                            <th className="p-4 text-left font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr
                                key={index}
                                className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition`}
                            >
                                <td className="p-4 text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        {new Date(item.timestamp).toLocaleString('en-US', { 
                                            dateStyle: 'medium', 
                                            timeStyle: 'short' 
                                        })}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                        {item.location || '—'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-800">{item.remarks || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}