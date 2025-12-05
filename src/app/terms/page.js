'use client'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-700 mb-4">Effective Date: [Insert Date]</p>

        <p className="mb-4">
          By using our website or services, you agree to the following terms:
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          You must be at least 18 years old to use our services. Use of our services constitutes acceptance of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">2. Accounts and Access</h2>
        <p className="text-gray-700 mb-4">
          You are responsible for keeping your login credentials secure. Unauthorized access or misuse of your account is prohibited.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Use of Services</h2>
        <p className="text-gray-700 mb-4">
          Our services must be used in compliance with all applicable laws. Illegal or harmful activities are prohibited.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Intellectual Property</h2>
        <p className="text-gray-700 mb-4">
          All content, trademarks, and software are our property. Unauthorized copying or distribution is prohibited.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          We are not liable for damages arising from your use of our services. Services are provided “as-is” without warranties.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Modifications</h2>
        <p className="text-gray-700 mb-4">
          We may update these Terms at any time. Continued use after changes constitutes acceptance.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Termination</h2>
        <p className="text-gray-700 mb-4">
          We may suspend or terminate accounts violating these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">8. Contact</h2>
        <p className="text-gray-700">
          Questions? Email us at <a href="mailto:support@shiptrackglobal.com" className="text-blue-600 hover:underline">support@shiptrackglobal.com</a>.
        </p>
      </div>
    </div>
  )
}
