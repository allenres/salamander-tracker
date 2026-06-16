import { useState, useEffect } from 'react';
import { getVideos } from '../api.js';
import { useNavigate } from "react-router-dom";

function VideoCard({ videoName, onSelect, showTags }) {
    const [isHovered, setIsHovered] = useState(false);
    

    return (
        <button
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-bg border-2 border-primary/30 hover:border-primary hover:scale-[1.02] active:scale-[0.98] rounded-xl overflow-hidden text-left flex flex-col justify-between shadow-xs transition-all cursor-pointer group w-full"
        >
            <div className="w-full aspect-video bg-text/5 overflow-hidden relative border-b border-secondary/20">
                <img 
                    src={isHovered ? `/preview/${videoName}` : `/thumbnail/${videoName}`} 
                    alt={videoName}
                    className="w-full h-full object-cover transition-opacity duration-200"
                    loading="lazy"
                />
                
                {isHovered && (
                    <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm animate-pulse uppercase tracking-wider">
                        Preview
                    </span>
                )}
            </div>

            <div className="p-4 w-full">
                <span className="text-xs font-mono bg-secondary/40 text-text/80 px-2 py-1 rounded-sm block truncate">
                    {videoName}
                </span>
                {showTags && <span className="text-xs font-mono bg-secondary/40 text-text/80 px-2 py-1 rounded-sm block truncate">
                    {videoName}
                </span>}
                
            </div>
        </button>
    );
}

function Videos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(null);
    const navigate = useNavigate();
    const [isShowTag, setIsShowTag] = useState(false);

    useEffect(() => {
        getVideos()
            .then((data) => {
                setVideos(data);
                setLoading(false);
            }).catch((err) => {
                setError(err.message || "Failed to fetch videos.");
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2 text-text">Video Analyzer</h1>
            <p className="text-text/80 mb-6 font-medium">Select a Video</p>

            <div className="mb-6">
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-bg border border-secondary/60 rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary cursor-pointer"
                >
                    <option value="all">All Videos</option>
                    <option value="pinned">Pinned</option>
                </select>
                <button 
                    className='bg-bg border border-secondary/60 rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary cursor-pointer'
                    >Add tag
                </button>
                <button 
                    className='bg-bg border border-secondary/60 rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary cursor-pointer'
                    onClick={() => {setIsShowTag(!isShowTag)}}
                >Show tags</button>
                
            </div>

            {/* --- Loading State --- */}
            {loading && (
                <div className="flex flex-col items-center justify-center my-12 gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-primary"></div>
                    <p className="text-sm font-semibold text-primary animate-pulse">Loading videos...</p>
                </div>
            )}

            {/* --- Error State --- */}
            {error && !loading && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r shadow-xs">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-bold">Error Display</p>
                            <p className="text-xs text-red-600 mt-1">Could not load videos: {error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Success state / Content Video List --- */}
            {!loading && !error && (
                <div className="bg-secondary/20 border-2 border-secondary rounded-2xl p-6 min-h-[350px]">
                    {videos.length === 0 ? (
                        <p className="text-center text-text/60 py-12">No videos found available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {videos.map((videoName) => (
                                <VideoCard 
                                    key={videoName}
                                    videoName={videoName}
                                    showTags={isShowTag}
                                    onSelect={() => navigate(`/preview/${videoName}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Videos;