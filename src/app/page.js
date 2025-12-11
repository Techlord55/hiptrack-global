"use client";

import { useState } from "react";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import ShippingCarousel from "@/components/ShippingCarousel";
import ChatWidget from "@/components/ChatWidget";
import Navbar from "@/components/Navbar";

import Link from "next/link";
import { Truck, Globe, Clock, Shield, Headphones } from "lucide-react";


export default function Home() {
  const features = [
    {
      icon: <Truck className="w-12 h-12 text-purple-600" />,
      title: "Fast Delivery",
      description: "Express shipping options with real-time tracking across the globe",
    },
    {
      icon: <Globe className="w-12 h-12 text-orange-500" />,
      title: "Global Network",
      description: "Worldwide coverage with reliable delivery to over 220 countries",
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-600" />,
      title: "Secure Shipping",
      description: "Insurance coverage and secure handling for all your shipments",
    },
    {
      icon: <Clock className="w-12 h-12 text-orange-500" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you anytime",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Navbar */}
      <Navbar showFullNav={true} />

      {/* Hero Section with Carousel Background */}
      <main className="grow">
        <div className="relative py-20 md:py-32 text-white overflow-hidden min-h-[600px] flex items-center">
          {/* Background Carousel */}
          <ShippingCarousel />

          {/* Hero Content */}
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              Ship Smarter.<br />Track Faster.
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-lg text-white" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.7)' }}>
              Experience seamless global logistics with real-time tracking, reliable delivery, and 24/7 support.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link
                href="/track"
                className="px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition duration-300 transform"
              >
                Track Shipment
              </Link>
              <Link
                href="/services/express"
                className="px-10 py-4 bg-transparent border-2 border-white text-white text-lg font-bold rounded-full hover:bg-white hover:text-purple-600 transition duration-300"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
              Why Choose ShipTrack Global?
            </h2>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              We provide comprehensive shipping solutions tailored to your needs with cutting-edge technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Banner Section */}
        <div className="relative h-96 bg-linear-to-r from-purple-900 to-orange-600">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Trusted by 10,000+ Businesses Worldwide
              </h2>
              <p className="text-xl text-white mb-8 opacity-90">
                Join the companies that rely on us for their shipping needs
              </p>
              <Link
                href="/about"
                className="inline-block px-8 py-3 bg-white text-purple-600 font-bold rounded-full hover:shadow-xl transition duration-300"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              What Our Customers Say
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Real feedback from real customers
            </p>
            <ReviewsCarousel />
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-linear-to-r from-purple-600 to-orange-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Ship?</h2>
            <p className="text-xl mb-8 opacity-90">
              Get started today and experience hassle-free shipping
            </p>
            <Link
              href="/track"
              className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition duration-300 transform"
            >
              Start Tracking Now
            </Link>
          </div>
        </div>
      </main>

      <ChatWidget />
     
    </div>
  );
}