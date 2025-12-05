'use client'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">Effective Date: [Insert Date]</p>

        <p className="mb-4">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website or services.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>Personal information you provide (e.g., name, email, phone).</li>
          <li>Information about your usage of our website (pages visited, interactions).</li>
          <li>Device and browser information for security and analytics purposes.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>To provide and improve our services.</li>
          <li>To communicate with you regarding updates, offers, or account matters.</li>
          <li>For security, fraud prevention, and legal compliance.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Data Sharing</h2>
        <p className="text-gray-700 mb-4">
          We do not sell your personal information. We may share data with trusted service providers and comply with legal requests.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Cookies and Tracking</h2>
        <p className="text-gray-700 mb-4">
          Our site may use cookies and analytics tools. You can manage cookies through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Data Security</h2>
        <p className="text-gray-700 mb-4">
          We implement technical and administrative measures to protect your information. However, no system is completely secure; use our site at your own risk.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Your Rights</h2>
        <p className="text-gray-700 mb-4">
          You can access, update, or request deletion of your personal data and opt-out of marketing communications.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contact Us</h2>
        <p className="text-gray-700">
          Questions? Email us at <a href="mailto:support@shiptrackglobal.com" className="text-blue-600 hover:underline">support@shiptrackglobal.com</a>.
        </p>
      </div>
    </div>
  )
}
