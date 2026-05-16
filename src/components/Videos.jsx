import { useState, useEffect } from 'react';
import { getVideos } from '../mockApi.js';
import { Link } from "react-router-dom";

function Videos() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    useEffect(() => {
        getVideos()
            .then((data) => {
                setVideos(data)
                setLoading(false)
            }).catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading videos...</p>;
    }

    if (error) {
        return <p>Could not load videos: {error}</p>;
    }

    return (
        <div className="videos-section">
            <h1>Available Videos</h1>
            {videos.map((videoName) => (
                <li key={videoName}>
                    <Link to={`/preview/${videoName}`}>{videoName}</Link>
                </li>
            ))}
            <p>Video list will go here.</p>
        </div>
    )
}
export default Videos;