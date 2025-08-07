'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import './video.css';

export default function VideoAsciiPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const asciiCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const charCols = 200; // resolution control

  useEffect(() => {
    const asciiChars = "@%#*+=-:. ";
    const video = videoRef.current;
    const videoCanvas = videoCanvasRef.current;
    const videoCtx = videoCanvas.getContext('2d');
    const asciiCanvas = asciiCanvasRef.current;
    const asciiCtx = asciiCanvas.getContext('2d');

    const aspectFix = 1; // char height/width ratio
    const step = 1;
    const noiseThreshold = 60;

    const handleChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      video.src = url;
      video.play();
    };

    const fileInput = fileInputRef.current;
    fileInput?.addEventListener('change', handleChange);

    const handleMetadata = () => {
      const containerWidth = asciiCanvas.parentNode.clientWidth;
      const charWidth = containerWidth / charCols;
      const charHeight = charWidth / aspectFix;
      const scale = charCols / video.videoWidth;
      const targetHeight = Math.floor(video.videoHeight * scale);

      videoCanvas.width = charCols;
      videoCanvas.height = targetHeight;
      asciiCanvas.width = charCols * charWidth;
      asciiCanvas.height = targetHeight * charHeight;

      asciiCtx.font = `${charHeight}px monospace`;
      asciiCtx.textBaseline = 'top';

      const renderFrame = () => {
        if (video.paused || video.ended) return;

        videoCtx.drawImage(video, 0, 0, charCols, targetHeight);
        const { data } = videoCtx.getImageData(0, 0, charCols, targetHeight);

        asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);

        for (let y = 0; y < targetHeight; y += step) {
          for (let x = 0; x < charCols; x += step) {
            const i = (y * charCols + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const lum = (r + g + b) / 3;

            if (lum < noiseThreshold) continue;

            const index = Math.floor((255 - lum) / 255 * (asciiChars.length - 1));
            const char = asciiChars[index];
            const opacity = Math.min(1, Math.max(0.2, lum / 255));

            asciiCtx.fillStyle = `rgba(255,255,255,${opacity.toFixed(2)})`;
            asciiCtx.fillText(char, x * charWidth, y * charHeight);
          }
        }

        requestAnimationFrame(renderFrame);
      };

      renderFrame();
    };

    video?.addEventListener('loadedmetadata', handleMetadata);

    return () => {
      video?.removeEventListener('loadedmetadata', handleMetadata);
      fileInput?.removeEventListener('change', handleChange);
    };
  }, [charCols]);

  return (
    <div>
      <div className="container">
        <div className="canvas-wrapper">
          <canvas id="asciiCanvas" ref={asciiCanvasRef}></canvas>
        </div>

        <div className="controls">
          <label htmlFor="upload">Upload Video</label>
          <input type="file" id="upload" accept="video/*" ref={fileInputRef} />
        </div>
      </div>

      <video ref={videoRef} muted autoPlay playsInline style={{ display: 'none' }} />
      <canvas ref={videoCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}
