import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/HomePage';
import SourcePage from './pages/SourcePage'; // ← import the new page
import Footer from './components/Footer';
import DetectionPage from './pages/DetectionPage';
import './App.css'; // Import your CSS file

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/detection" element={<DetectionPage />} />
        <Route path="/sources" element={<SourcePage />} />  
      </Routes>
      <Footer />
    </Router>
  );
}