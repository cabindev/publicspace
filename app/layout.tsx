import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Healthy Public Spaces',
  description: 'สร้างสรรค์พื้นที่สาธารณะที่ดีต่อสุขภาพสำหรับทุกคน',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}