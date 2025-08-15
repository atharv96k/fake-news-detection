import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-800 text-white px-6 py-3 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="font-bold text-xl hover:text-gray-300 transition-colors">
          TruthLens
        </Link>
        <Link 
          to="/detection" 
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Fact Check Now
        </Link>
      </div>
    </nav>
  );
}
