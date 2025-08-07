'use client'

import './styles.css';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const asciiChars = "$@B%8&WM#*oahkbdpqwmZ0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'.";
  const [outputWidth, setOutputWidth] = useState(120);
  const [brightnessBoost, setBrightnessBoost] = useState(1.3);
  const [useColor, setUseColor] = useState(true);
  const [currentAsciiText, setCurrentAsciiText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const router = useRouter();
  const asciiCanvasRef = useRef(null);
  const imageCanvasRef = useRef(null);

  const charWidth = 6;
  const charHeight = 12;
  const fontSize = 10;
  const noiseThreshold = 40;

  let zoomLevel = 100; // Start at 100%

  const handleZoomIn = () => {
    zoomLevel = Math.min(300, zoomLevel + 10); // max 300%
    document.body.style.zoom = `${zoomLevel}%`;
  };

  const handleZoomOut = () => {
    zoomLevel = Math.max(20, zoomLevel - 10); // min 20%
    document.body.style.zoom = `${zoomLevel}%`;
  };


  useEffect(() => {
    if (imageFile) {
      const img = new Image();
      img.onload = () => convertToAscii(img);
      img.src = URL.createObjectURL(imageFile);
    }
  }, [outputWidth, brightnessBoost, useColor, imageFile]);

  function convertToAscii(img) {
    const asciiCanvas = asciiCanvasRef.current;
    const asciiCtx = asciiCanvas.getContext("2d");

    const imageCanvas = imageCanvasRef.current;
    const imageCtx = imageCanvas.getContext("2d");

    const scale = outputWidth / img.width;
    const outputHeight = Math.floor(img.height * scale * 0.5);

    imageCanvas.width = outputWidth;
    imageCanvas.height = outputHeight;
    imageCtx.drawImage(img, 0, 0, outputWidth, outputHeight);

    const { data } = imageCtx.getImageData(0, 0, outputWidth, outputHeight);

    asciiCanvas.width = outputWidth * charWidth;
    asciiCanvas.height = outputHeight * charHeight;
    asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
    asciiCtx.font = `${fontSize}px monospace`;
    asciiCtx.textBaseline = "top";

    let asciiText = "";

    for (let y = 0; y < outputHeight; y++) {
      let line = "";
      for (let x = 0; x < outputWidth; x++) {
        const i = (y * outputWidth + x) * 4;
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        r = Math.min(255, r * brightnessBoost);
        g = Math.min(255, g * brightnessBoost);
        b = Math.min(255, b * brightnessBoost);

        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        if (lum < noiseThreshold) {
          line += " ";
          continue;
        }

        const index = Math.floor((255 - lum) / 255 * (asciiChars.length - 1));
        const char = asciiChars[index];
        line += char;

        asciiCtx.fillStyle = useColor ? `rgb(${r},${g},${b})` : `rgb(${lum},${lum},${lum})`;
        asciiCtx.fillText(char, x * charWidth, y * charHeight);
      }
      asciiText += line + "\n";
    }

    setCurrentAsciiText(asciiText);
  }

  function handleDownloadTxt() {
    const blob = new Blob([currentAsciiText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ascii-art.txt";
    link.click();
  }

  function handleDownloadPng() {
    const link = document.createElement("a");
    link.href = asciiCanvasRef.current.toDataURL("image/png");
    link.download = "ascii-art.png";
    link.click();
  }

  return (
    <main>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />

      <div className="main-container">
        <div className="canvas-container">
          <canvas ref={asciiCanvasRef} id="asciiCanvas"></canvas>
          <canvas ref={imageCanvasRef} id="imageCanvas" style={{ display: "none" }}></canvas>
        </div>

        <div className="controls-panel">
          <label htmlFor="widthSlider">
            Output Width: {outputWidth}px
          </label>
          <input
            id="widthSlider"
            type="range"
            min="50"
            max="500"
            value={outputWidth}
            onChange={(e) => setOutputWidth(parseInt(e.target.value))}
          />

          <label htmlFor="brightnessSlider">
            Brightness: {brightnessBoost.toFixed(1)}x
          </label>
          <input
            id="brightnessSlider"
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={brightnessBoost}
            onChange={(e) => setBrightnessBoost(parseFloat(e.target.value))}
          />

          <button className='btn' onClick={() => setUseColor(!useColor)}>
            Color: {useColor ? "ON" : "OFF"}
          </button>

          <button className='btn' onClick={handleDownloadTxt}>Download .txt</button>
          <button className='btn' onClick={handleDownloadPng}>Download .png</button>

          <button className='btn' onClick={handleZoomIn}>🔍 Zoom In</button>
          <button className='btn' onClick={handleZoomOut}>🔎 Zoom Out</button>
        </div>
      </div>
    </main>
  );
}
