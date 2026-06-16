import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-4">
                Salamander Tracker
            </h1>
            <p className="text-lg text-text/80 mb-8 max-w-md mx-auto">
                Pick a video from the videos page to start analyzing.
            </p>
            <Link 
                to="/videos" 
                className="inline-block bg-primary text-bg hover:bg-primary/90 font-semibold px-6 py-3 rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
                Go to Videos
            </Link>
        </div>
    )
}
export default Home;