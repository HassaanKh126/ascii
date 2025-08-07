'use client';

import { useEffect, useRef } from 'react';
import './webcam.css';

export default function WebcamAsciiPage() {
  const asciiCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);

  useEffect(() => {
    const asciiChars = '@%#*+=-:. ';
    const targetWidth = 120;
    const charWidth = 4;
    const charHeight = 4;
    const fontSize = 5;
    const noiseThreshold = 40;

    const asciiCanvas = asciiCanvasRef.current;
    const asciiCtx = asciiCanvas.getContext('2d');

    const videoCanvas = videoCanvasRef.current;
    const videoCtx = videoCanvas.getContext('2d');

    const video = videoRef.current;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();

        video.addEventListener('loadeddata', () => {
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const scale = targetWidth / videoWidth;
          const targetHeight = Math.floor(videoHeight * scale);

          // Set canvas dimensions
          videoCanvas.width = targetWidth;
          videoCanvas.height = targetHeight;
          asciiCanvas.width = targetWidth * charWidth;
          asciiCanvas.height = targetHeight * charHeight;

          asciiCtx.font = `${fontSize}px monospace`;
          asciiCtx.textBaseline = 'top';

          const drawASCII = () => {
            videoCtx.drawImage(video, 0, 0, targetWidth, targetHeight);
            const frame = videoCtx.getImageData(0, 0, targetWidth, targetHeight).data;

            asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);

            for (let y = 0; y < targetHeight; y++) {
              for (let x = 0; x < targetWidth; x++) {
                const idx = (y * targetWidth + x) * 4;
                const r = frame[idx];
                const g = frame[idx + 1];
                const b = frame[idx + 2];
                const lum = (r + g + b) / 3;

                if (lum < noiseThreshold) continue;

                const charIndex = Math.floor((255 - lum) / 255 * (asciiChars.length - 1));
                const char = asciiChars[charIndex];
                const opacity = Math.min(1, Math.max(0.2, lum / 255));

                asciiCtx.fillStyle = `rgba(255,255,255,${opacity})`;
                asciiCtx.fillText(char, x * charWidth, y * charHeight);
              }
            }

            requestAnimationFrame(drawASCII);
          };

          requestAnimationFrame(drawASCII);
        });
      })
      .catch((err) => {
        alert('Error accessing webcam: ' + err.message);
      });
  }, []);

  return (
    <div className="webcam-container">
      <canvas ref={asciiCanvasRef} id="asciiCanvas"></canvas>
      <video ref={videoRef} muted autoPlay playsInline style={{ display: 'none' }}></video>
      <canvas ref={videoCanvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
