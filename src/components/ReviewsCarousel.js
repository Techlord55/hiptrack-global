"use client";

import { useEffect, useState } from "react";

// Example 15 reviews
const reviews = [
  { name: "Alice Johnson", role: "Logistics Manager", image: "/reviews/alice.jpg", text: "ShipTrack Global is seamless and incredibly fast." },
  { name: "Michael Smith", role: "E-commerce Owner", image: "/reviews/michael.jpg", text: "Reliable and accurate tracking." },
  { name: "Sophie Lee", role: "Supply Chain Coordinator", image: "/reviews/sophie.jpg", text: "User-friendly interface and excellent support." },
  { name: "John Brayam", role: "Warehouse Manager", image: "/reviews/john.jpg", text: "Helps keep our inventory organized." },
  { name: "Emma Davis", role: "Operations Lead", image: "/reviews/emma.jpg", text: "Easy to use and fast updates." },
  { name: "Liam Brown", role: "Delivery Supervisor", image: "/reviews/liam.jpg", text: "Accurate real-time location tracking." },
  { name: "Olivia Taylor", role: "Shipping Coordinator", image: "/reviews/olivia.jpg", text: "Fantastic customer support team." },
  { name: "Noah Wilson", role: "Fleet Manager", image: "/reviews/noah.jpg", text: "Makes fleet management effortless." },
  { name: "Ava Martinez", role: "Logistics Analyst", image: "/reviews/ava.jpg", text: "Insights and reports are very useful." },
  { name: "Ethan Anderson", role: "Supply Chain Manager", image: "/reviews/ethan.jpg", text: "Highly recommend ShipTrack Global." },
  { name: "Isabella Thomas", role: "Warehouse Coordinator", image: "/reviews/isabella.jpg", text: "Reduces errors in shipment handling." },
  { name: "Mason Jackson", role: "Operations Executive", image: "/reviews/mason.jpg", text: "The dashboard is clean and fast." },
  { name: "Mia White", role: "Customer Support Manager", image: "/reviews/mia.jpg", text: "Customers love the real-time updates." },
  { name: "Lucas Harris", role: "Logistics Analyst", image: "/reviews/lucas.jpg", text: "Tracking multiple shipments is easy." },
  { name: "Charlotte Clark", role: "Inventory Manager", image: "/reviews/charlotte.jpg", text: "Makes managing shipments stress-free." },
];

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slide automatically every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
        <div className="relative max-w-3xl mx-auto">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ease-in-out transform ${
                index === currentIndex ? "opacity-100 translate-x-0" : "opacity-0 absolute top-0 left-0 w-full"
              } bg-white p-6 rounded-xl shadow-lg`}
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold">{review.name}</h3>
                  <p className="text-gray-500 text-sm">{review.role}</p>
                </div>
              </div>
              <p className="text-gray-700 text-center text-lg">"{review.text}"</p>
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {reviews.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentIndex ? "bg-orange-500" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}
