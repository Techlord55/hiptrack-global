"use client";

import { useState } from "react";
import Link from "next/link";

// Navigation Link Component
const NavLink = ({ href, children, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className="block md:inline-block text-gray-700 hover:text-purple-600 transition-colors duration-300 py-2 md:py-0 font-medium"
  >
    {children}
  </Link>
);

// Dropdown Menu Component
const DropdownMenu = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium">
        {title}
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="block px-4 py-3 hover:bg-purple-50 hover:backdrop-blur-sm transition duration-200 rounded-lg"
            >
              <div className="font-semibold text-gray-800">{item.title}</div>
              {item.description && (
                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Navbar({ showFullNav = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const servicesItems = [
    { title: "Express Shipping", description: "Fast delivery for urgent shipments", href: "/services/express" },
    { title: "Freight Services", description: "Large volume shipping solutions", href: "/services/freight" },
    { title: "International Shipping", description: "Global delivery network", href: "/services/international" },
    { title: "Supply Chain Solutions", description: "End-to-end logistics management", href: "/services/supply-chain" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/logo/logo.png"
            alt="ShipTrack Global Logo"
            className="h-12 md:h-14 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            style={{ background: "transparent" }}
            onError={(e) => {
              const extensions = ["jpg", "jpeg", "svg", "webp"];
              const currentExt = e.target.src.split(".").pop();
              const nextExtIdx = extensions.indexOf(currentExt) + 1;
              if (nextExtIdx < extensions.length) {
                e.target.src = `/logo/logo.${extensions[nextExtIdx]}`;
              }
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        {showFullNav ? (
          <>
            <nav className="hidden md:flex items-center space-x-8 text-base">
              <NavLink href="/">Home</NavLink>
              <DropdownMenu title="Services" items={servicesItems} />
              <NavLink href="/track">Tracking</NavLink>
              <NavLink href="/support">Support</NavLink>
              <NavLink href="/about">About Us</NavLink>
            </nav>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </>
        ) : (
          <Link href="/" className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-300">
            Back to Home
          </Link>
        )}
      </div>

      {/* Mobile Navigation */}
      {showFullNav && mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg">
          <div className="font-semibold text-gray-900 mb-2">Services</div>
          {servicesItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="block pl-4 py-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.title}
            </Link>
          ))}
          <NavLink href="/track" onClick={() => setMobileMenuOpen(false)}>Tracking</NavLink>
          <NavLink href="/support" onClick={() => setMobileMenuOpen(false)}>Support</NavLink>
          <NavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
         <NavLink href="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>

        </div>
      )}
    </header>
  );
}
