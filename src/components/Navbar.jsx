import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="bg-primary text-bg px-6 py-4 flex justify-between items-center shadow-md">
            <span className="font-bold text-xl tracking-wide">Salamander Tracker</span>
            <div className="flex gap-8 font-medium">
                <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                <Link to="/videos" className="hover:text-accent transition-colors">Videos</Link>
            </div>
        </nav>
    )
}
export default Navbar;