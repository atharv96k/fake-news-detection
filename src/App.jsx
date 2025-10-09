import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/HomePage';
import Footer from './components/Footer';
import DetectionPage from './pages/DetectionPage';
import './App.css'; 
import ScrollToTop from './components/ScrollToTop';
import FirefoxExtensionPage from './components/FirefoxExtensionPage';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/detection" element={<DetectionPage />} />
        <Route path="/firefox-extension" element={<FirefoxExtensionPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}