import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail, submitProcessingJob, getJobStatus } from '../api.js';

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

        const targetR = parseInt(color.substring(1, 3), 16);
        const targetG = parseInt(color.substring(3, 5), 16);
        const targetB = parseInt(color.substring(5, 7), 16);

        for (let i = 0; i < px.length; i += 4) {
            const r = px[i];
            const g = px[i + 1];
            const b = px[i + 2];

            const distance = Math.sqrt(
                Math.pow(r - targetR, 2) +
                Math.pow(g - targetG, 2) +
                Math.pow(b - targetB, 2)
            );

            if (distance <= tolerance) {
                px[i] = 255;
                px[i + 1] = 255;
                px[i + 2] = 255;
            } else {
                px[i] = 0;
                px[i + 1] = 0;
                px[i + 2] = 0;
            }
        }

        ctx.putImageData(data, 0, 0);
    }, [imageReady, color, tolerance]);
    
    const [isProcessing, setIsProcessing] = useState(false)
    const [jobId, setJobId] = useState(null);

     useEffect(() => {
        //if not jobId return
        if(!jobId) return;

        const id = setInterval(async () => {
            const status = await getJobStatus(jobId);

            if(!status){
                clearInterval(id)
                return
            }

            if(status.status === "done"){
                setIsProcessing(false)
                clearInterval(id)
            }

        }, 5000)

        return () => clearInterval(id)
    }, 
    [jobId])


    function processVideo() {
        setIsProcessing(true)
        const params = [filename, color, tolerance];
        console.log(params)
        getJobId(params)
    }

    async function getJobId(arr) {
        const process = await submitProcessingJob(arr[0], arr[1], arr[2]);
        setJobId(process.jobId)
    }

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
                                {!imageReady && (
                                    <div className="flex flex-col items-center justify-center w-[320px] h-[180px]">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary"></div>
                                    </div>
                                )}
                                {imageReady && (<img src={thumbnail} alt="Original Thumbnail" className="w-[320px] h-[180px]" />)}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-text/50 mb-1">Binarized</p>
                                {!imageReady && (
                                    <div className="flex flex-col items-center justify-center w-[320px] h-[180px]">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary"></div>
                                    </div>
                                )}
                                {imageReady && (<canvas
                                    ref={canvasRef}
                                    className="w-[320px] h-[180px]"
                                />)}
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
                    <button className="
                                w-full mt-6
                                bg-primary text-white
                                font-semibold text-sm
                                px-4 py-3
                                rounded-xl
                                shadow-xs
                                transition-all duration-200
                                border border-primary/40
                                cursor-pointer
                                disabled:opacity-50
                            "
                        onClick={processVideo}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing video..." : "Process Video with These Settings"}

                    </button>

                </div>
                
            </div>
        </div>
    );
}