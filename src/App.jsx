import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/HomePage';
import DetectionPage from './pages/Detectionpage';
import SourcePage from './pages/SourcePage'; // ← import the new page
import Footer from './components/Footer';

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