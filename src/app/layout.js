import './globals.css'

export const metadata = {
  title: 'Shipment Tracking System',
  description: 'Track your shipments in real-time',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 🔑 Fix for Hydration Mismatch Error caused by browser extensions */}
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}