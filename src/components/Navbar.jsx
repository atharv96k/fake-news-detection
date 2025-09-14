import { Link } from 'react-router-dom'; 
 
export default function Navbar() { 
  return ( 
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 shadow-sm"> 
      <div className="flex justify-between items-center max-w-7xl mx-auto"> 
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-xl text-gray-800">TruthLens</span>
        </Link> 
        <Link  
          to="/detection"  
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors" 
        > 
          Fact Check Now 
        </Link> 
      </div> 
    </nav> 
  ); 
}