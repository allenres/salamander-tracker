import { Link, useParams } from 'react-router-dom';

export default function Preview() {
  const { filename } = useParams();

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
            
            {/* Left/Center Column: Main video container layout placeholder */}
            <div className="lg:col-span-2">
                <div className="aspect-video bg-text/5 border-2 border-dashed border-secondary/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center min-h-[300px]">
                    <svg className="w-12 h-12 text-primary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-text font-medium">Video Player Placeholder</p>
                    <p className="text-xs text-text/60 mt-1">Thumbnail display will mount here.</p>
                </div>
            </div>

            {/* Right Column: Configuration Controls panel layout placeholder */}
            <div className="bg-secondary/10 border border-secondary/40 rounded-2xl p-5 h-fit">
                <h3 className="font-bold text-text mb-3 text-lg border-b border-secondary/30 pb-2">
                    Tuning Controls
                </h3>
                
                {/* Visual placeholder items */}
                <div className="space-y-4 py-2">
                    <div>
                        <label className="block text-xs font-bold text-text/70 uppercase tracking-wider mb-1">Detection Sensitivity</label>
                        <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-primary rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text/70 uppercase tracking-wider mb-1">Analysis Mode</label>
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                            <span className="bg-primary text-bg text-center py-1.5 rounded-md shadow-xs">Automated</span>
                            <span className="bg-bg text-text/60 border border-secondary text-center py-1.5 rounded-md">Manual Toggle</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-text/50 mt-6 pt-4 border-t border-secondary/30 italic">
                    Tuning controls will go here in a future pair program.
                </p>
            </div>

        </div>
    </div>
  );
}