import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail } from '../mockApi.js';

export default function Preview() {
  const { filename } = useParams();
  const [thumbnail, setThumbnail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [color, setColor] = useState('#000000');
  const [tolerance, setTolerance] = useState(0);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    getThumbnail(filename)
      .then((data) => {
        setThumbnail(data);
        setLoading(false);
      }).catch((err) => {
        setError(err.message || "Failed to fetch videos.");
        setLoading(false);
      });
  }, [filename]);

  useEffect(() => {
    if (!thumbnail) return;
    setImageReady(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageReady(true);
    };
    img.src = thumbnail;
  }, [thumbnail]);

  useEffect(() => {
    if (!imageReady) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    
    for (let i = 0; i < px.length; i += 4) {
        // px[i]     = red channel of this pixel (0-255)
        // px[i + 1] = green channel
        // px[i + 2] = blue channel
        // px[i + 3] = alpha (transparency, usually leave alone)
        //
        // Your algorithm from 334 goes here. Look at the pixel above,
        // look at `color` and `tolerance`, decide the pixel's new value,
        // and write it back the same way:
        //   px[i]     = newRed;
        //   px[i + 1] = newGreen;
        //   px[i + 2] = newBlue;
    }

    ctx.putImageData(data, 0, 0);
  }, [imageReady, color, tolerance]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Link Layout */}
      <div className="mb-6">
        <Link 
          to="/videos" 
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors gap-1 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to videos
        </Link>
      </div>

      {/* Header section */}
      <div className="border-b border-secondary/40 pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text break-all">
          Preview: <span className="font-mono text-xl bg-secondary/30 px-2 py-0.5 rounded-sm">{filename}</span>
        </h1>
      </div>

      {/* Dashboard Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {loading && (
          <div className="flex flex-col items-center justify-center my-12 gap-3 lg:col-span-2 bg-text/5 border-2 border-dashed border-secondary/60 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary"></div>
            <p className="text-sm font-semibold text-primary animate-pulse">Loading preview...</p>
          </div>
        )}

        {/* --- Error State --- */}
        {error && !loading && (
          <div className="lg:col-span-2 bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r shadow-xs">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-bold">Error Preview</p>
                <p className="text-xs text-red-600 mt-1">Could not preview video: {error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Left/Center Column: Side-by-side Image and HTML5 Canvas pipeline display */}
        {!loading && !error && (
          <div className="lg:col-span-2">
            <div className="aspect-video bg-text/5 border-2 border-dashed border-secondary/60 rounded-2xl flex flex-row items-center justify-center gap-4 p-6 text-center min-h-[300px]">
              <div>
                <p className="text-xs font-semibold text-text/50 mb-1">Original</p>
                <img src={thumbnail} alt="Original Thumbnail" className="w-[320px] h-[180px] object-cover rounded-md shadow-md"/>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-text/50 mb-1">Canvas Output</p>
                <canvas 
                  ref={canvasRef} 
                  className="w-[320px] h-[180px] object-cover rounded-md shadow-md bg-white" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Configuration Controls panel layout */}
        <div className="bg-secondary/10 border border-secondary/40 rounded-2xl p-5 h-fit">
          <h3 className="font-bold text-text mb-3 text-lg border-b border-secondary/30 pb-2">
            Tuning Controls
          </h3>
          
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-text/70 uppercase tracking-wider mb-1">
                Tolerance ({tolerance})
              </label>
              <input 
                id="tolerance" 
                className="h-2 w-full rounded-full cursor-pointer" 
                type="range" 
                min="0" 
                max="255"
                value={tolerance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  console.log('Tolerance updated:', val);
                  setTolerance(val);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text/70 uppercase tracking-wider mb-1">
                Target Color
              </label>
              <input 
                id="colorPicker" 
                className="w-full h-10 rounded-md cursor-pointer bg-transparent" 
                type="color"
                value={color}
                onChange={(e) => {
                  console.log('Color updated:', e.target.value);
                  setColor(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}