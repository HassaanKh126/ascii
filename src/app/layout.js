'use client'
import './globals.css';
import { useRouter } from "next/navigation"

export default function RootLayout({ children }) {
  const router = useRouter();
  return (
    <html lang="en">
      <body>
        <header className="header">
          <h2>ASCII Art Generator</h2>
          <nav className="nav-links">
            <button onClick={() => router.push('/Image')}>Image</button>
            <button onClick={() => router.push('/Video')}>Video</button>
            <button onClick={() => router.push('/Webcam')}>Webcam</button>
          </nav>
        </header>

        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
