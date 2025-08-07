'use client';

import { useRouter } from 'next/navigation';
import './landing.css';

export default function Home() {
  const router = useRouter();

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>ASCII Art Generator</h1>
        <p>Convert images, videos, and webcam streams into expressive ASCII art in real-time.</p>
      </div>

      <div className="cta-buttons">
        <button onClick={() => router.push('/Image')}>Image</button>
        <button onClick={() => router.push('/Video')}>Video</button>
        <button onClick={() => router.push('/Webcam')}>Webcam</button>
      </div>
    </div>
  );
}
