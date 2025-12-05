import ReviewsCarousel from "@/components/ReviewsCarousel";

// Simple component for a navigation link using standard <a> tag
const NavLink = ({ href, children }) => (
  <a href={href} className="text-gray-600 hover:text-blue-700 transition duration-150">
    {children}
  </a>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      
      {/* Header (FedEx-style) */}
      <header className="shadow-md bg-white border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-extrabold text-purple-600">ShipTrack</span>
            <span className="text-3xl font-extrabold text-orange-500">Global</span>
          </div>
          <nav className="hidden md:flex space-x-6 text-lg font-medium">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/track">Track</NavLink>
            <NavLink href="/support">Support</NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content: Tracking Hero Section */}
      <main className="flex-grow">
        <div className="relative py-20 md:py-32 bg-purple-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Simple. Reliable. Global.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Track your shipments across the globe in real-time. Click below to start your tracking process.
            </p>
            <div className="max-w-xl mx-auto">
              <a
                href="/track"
                className="inline-block px-12 py-4 bg-orange-500 text-white text-xl font-bold rounded-lg shadow-xl hover:bg-orange-600 transition duration-300 transform hover:scale-105 uppercase tracking-widest"
              >
                Start Tracking Now
              </a>
            </div>
          </div>
        </div>

        {/* ✅ Add the Reviews Carousel below the hero section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
            <ReviewsCarousel />
          </div>
        </div>
      </main>

      {/* Footer with Legal Links */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} ShipTrack Global. All Rights Reserved.</p>
            <nav className="flex space-x-6">
              <a href="/policy" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition">Terms of Use</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
