'use client'

export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center">Support</h1>

        <p className="text-gray-700 mb-6">
          Need help? Our support team is here for you.
        </p>

        <h2 className="text-2xl font-semibold mt-4 mb-2">1. Contact Us</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li>Email: <a href="mailto:support@shiptrackglobal.com" className="text-blue-600 hover:underline">support@shiptrackglobal.com</a></li>
          <li>Phone: +19297829204</li>
          <li>Live Chat: Mon–Fri, 9 AM – 5 PM (GMT+1)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-4 mb-2">2. FAQs</h2>
        <ul className="list-disc ml-6 mb-4 text-gray-700">
          <li><strong>How do I reset my password?</strong> Go to the login page and click "Forgot Password".</li>
          <li><strong>How do I track my shipment?</strong> Log in to your dashboard and check the shipment list.</li>
          <li><strong>How do I update my account info?</strong> Visit your profile settings in the dashboard.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-4 mb-2">3. Response Times</h2>
        <p className="text-gray-700 mb-4">
          We strive to respond to inquiries within 24–48 hours. For urgent issues, contact us via phone.
        </p>

        <h2 className="text-2xl font-semibold mt-4 mb-2">4. Feedback</h2>
        <p className="text-gray-700">
          We welcome feedback to improve our services. Submit feedback through the support form on this page.
        </p>
      </div>
    </div>
  )
}
