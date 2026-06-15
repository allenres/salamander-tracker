import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getThumbnail, submitProcessingJob, getJobStatus } from '../api.js';
import LinearProgress from '@mui/material/LinearProgress';

export default function Preview() {
    const { filename } = useParams();
    const [thumbnail, setThumbnail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState(null); // 'queued', 'running', 'done', 'error'
    const [processingMessage, setProcessingMessage] = useState(null);
    

    const [color, setColor] = useState('#000000');
    const [tolerance, setTolerance] = useState(0);

    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [imageReady, setImageReady] = useState(false);

    // Initial Fetch
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

    // Image Loader
    useEffect(() => {
        if (!thumbnail || thumbnail.length === 0) return;
        setImageReady(false);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imgRef.current = img;
            setImageReady(true);
        };
        img.src = thumbnail;
    }, [thumbnail]);

    // Canvas Binarization & Centroid Finding
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

        // Binarize Image
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

        // DFS Group Finder
        const width = canvas.width;
        const height = canvas.height;
        // Uint8Array is much faster for a 1D visited map than standard JS arrays
        const visited = new Uint8Array(width * height);
        let largestGroup = null;

        const exploreGroup = (startX, startY) => {
            const stack = [startY * width + startX];
            let size = 0;
            let sumX = 0;
            let sumY = 0;

            while (stack.length > 0) {
                const currentIdx = stack.pop();
                const cx = currentIdx % width;
                const cy = Math.floor(currentIdx / width);

                if (visited[currentIdx] === 1) continue;
                visited[currentIdx] = 1;

                size++;
                sumX += cx;
                sumY += cy;

                // up
                if (cy > 0 && px[(currentIdx - width) * 4] === 255 && visited[currentIdx - width] === 0) {
                    stack.push(currentIdx - width);
                }
                // down
                if (cy < height - 1 && px[(currentIdx + width) * 4] === 255 && visited[currentIdx + width] === 0) {
                    stack.push(currentIdx + width);
                }
                // left
                if (cx > 0 && px[(currentIdx - 1) * 4] === 255 && visited[currentIdx - 1] === 0) {
                    stack.push(currentIdx - 1);
                }
                // right
                if (cx < width - 1 && px[(currentIdx + 1) * 4] === 255 && visited[currentIdx + 1] === 0) {
                    stack.push(currentIdx + 1);
                }
            }

            return {
                size,
                centroidX: Math.floor(sumX / size),
                centroidY: Math.floor(sumY / size)
            };
        };

        // Scan the image to find the largest group of white (255) pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                // px array is flat RGBA. R channel is at idx * 4.
                if (px[idx * 4] === 255 && visited[idx] === 0) {
                    const group = exploreGroup(x, y);
                    if (!largestGroup || group.size > largestGroup.size) {
                        largestGroup = group;
                    }
                }
            }
        }

        // Draw the centroid marker if a group exists
        if (largestGroup) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(largestGroup.centroidX, largestGroup.centroidY, 10, 0, 2 * Math.PI);
            ctx.fill();

            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00ff22';
            ctx.stroke();
        }

    }, [imageReady, color, tolerance]);

    // Job Status Polling
    useEffect(() => {
        if (!jobId) return;
        
        const id = setInterval(async () => {
            try {
                const status = await getJobStatus(jobId);

                if (!status) {
                    clearInterval(id);
                    return;
                }

                setJobStatus(status.status);

                if (status.status === "done") {
                    setIsProcessing(false);
                    setProcessingMessage("Processing complete!");
                    clearInterval(id);
                }

                if (status.status === "error") {
                    setIsProcessing(false);
                    setProcessingMessage(status.error || "Job failed on the server.");
                    clearInterval(id);
                }
            } catch (err) {
                setIsProcessing(false);
                setJobStatus("error");
                setProcessingMessage("Failed to check job status.");
                clearInterval(id);
            }
        }, 1500);

        return () => clearInterval(id);
    }, [jobId]);

    // Submits the job to the API
    async function processVideo() {
        setIsProcessing(true);
        setProcessingMessage(null);
        setJobId(null); 

        try {
            // Remove the '#' from the hex color
            const hexWithoutHash = color.replace('#', '');

            const response = await submitProcessingJob(filename, hexWithoutHash, tolerance);

            setJobId(response.jobId);
        } catch (err) {
            // Handle submission failure and allow retry
            setIsProcessing(false);
            setJobStatus(null);
            setProcessingMessage(err.message || "Failed to submit job. Please try again.");
        }
    }

    async function getCsvDownload(jobId) {
        window.location.href = `/download/${jobId}`;
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
                                <img src={thumbnail} alt="Original Thumbnail" className="w-[320px] h-[180px] object-cover rounded-md shadow-md" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-text/50 mb-1">Binarized</p>
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
                                disabled={isProcessing}
                                onChange={(e) => setTolerance(Number(e.target.value))}
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
                                disabled={isProcessing}
                                onChange={(e) => setColor(e.target.value)}
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
                                disabled:cursor-not-allowed
                            "
                        onClick={processVideo}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing" : "Process Video with These Settings"}
                    </button>

                    {isProcessing && (
                        <div className="w-full mt-4 space-y-2">
                            <LinearProgress />
                            <div className="flex justify-between text-xs font-mono text-text/60">
                                {jobStatus && (<span className="capitalize">Status: {jobStatus}</span>)}
                            </div>
                        </div>
                    )}

                    {processingMessage && (
                        <div className="mt-10 p-3 rounded-lg  bg-bg border shadow-xs">
                            <div className={jobStatus === "done" ? "text-sm font-semibold text-green-600" : "text-sm font-semibold text-red-600"}>
                                {processingMessage}
                            </div>

                            {jobStatus === "done" && (
                                <button
                                    onClick={() => getCsvDownload(jobId)}
                                    className="mt-3 inline-flex w-full justify-center items-center gap-1 bg-primary hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                                >
                                    Download CSV Results
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}