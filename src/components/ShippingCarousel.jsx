"use client";

import { useState, useEffect } from "react";

const TOTAL_SLIDES = 9;

// Fallback local images
const fallbackImages = Array.from({ length: TOTAL_SLIDES }, (_, i) => `/ships/${i + 1}.jpg`);

export default function ShippingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState(fallbackImages);

  // Fetch images from Pexels API
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch(
          "https://api.pexels.com/v1/search?query=ship&per_page=8",
          {
            headers: {
              Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch from Pexels");

        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          setImages(data.photos.map((photo) => photo.src.landscape));
        }
      } catch (err) {
        console.error("Pexels API failed, using fallback images:", err);
        setImages(fallbackImages);
      }
    }

    fetchImages();
  }, []);

  // Slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === idx ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt={`Shipping ${idx + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to local image if online image fails
              e.target.src = fallbackImages[idx];
            }}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 via-purple-800/30 to-orange-600/40"></div>

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
