import './globals.css'

export const metadata = {
  title: 'FedEx TIFF to PDF Converter',
  description: 'Convert your TIFF files to PDF easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
