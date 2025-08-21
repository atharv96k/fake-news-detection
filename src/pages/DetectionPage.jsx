import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import VerdictBadge from '../components/VerdictBadge';
import HighlightedText from '../components/HighlightedText';
import SourceList from '../components/SourceList';

export default function DetectionPage() {
  const [newsText, setNewsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  // Using your custom SVGs from public/icons
  const steps = [
    { text: "Processing Text", icon: "/icons/preprocess.svg" },
    { text: "Fetching Evidence from Trusted Sources", icon: "/icons/search.svg" },
    { text: "Running AI Analysis", icon: "/icons/ai.svg" },
    { text: "Generating Verdict", icon: "/icons/verdict1.svg" },
  ];

  const checkNews = async () => {
    if (!newsText.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    setCurrentStep(0);

    // Step cycling
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => (prev + 1 < steps.length ? prev + 1 : prev));
    }, 1000);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://fake-news-detection-n9cs.onrender.com';
    try {
      const response = await fetch(`${API_BASE}/fact-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: newsText })
      });

      if (!response.ok) throw new Error('Failed to fetch verdict');

      const data = await response.json();

      setResult({
        verdict: data.verdict.toLowerCase(),
        confidence: data.confidence_percentage,
        explanation: data.verdict.toLowerCase() === 'fake'
          ? 'Independent fact-checking confirms this claim is false based on multiple credible sources.'
          : data.verdict.toLowerCase() === 'true'
            ? 'This claim is likely true according to verified sources.'
            : 'This claim could not be verified with high certainty.',
        sources: data.top_3_sources.map(src => ({
          title: src.title,
          url: src.url && src.url.startsWith('http') ? src.url : `https://${src.url}`,
          summary: ''
        })),
        highlightedKeywords: newsText.split(' ').filter(word => word.length > 6)
      });
    } catch (err) {
      console.error(err);
      setError('Error fetching verdict. Please try again.');
    } finally {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-15 px-6 relative">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Fact Check Tool
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <textarea
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none"
            placeholder="Paste your news headline or article here..."
            disabled={isLoading}
          />

          {!isLoading ? (
            <button
              onClick={checkNews}
              disabled={!newsText.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-all"
            >
              <Search size={20} /> Check News
            </button>
          ) : (
            <div
              className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-4 flex items-center justify-center gap-3 animate-pulse"
            >
              <img src={steps[currentStep].icon} alt="step icon" className="w-5 h-5" />
              {steps[currentStep].text}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <p className="mb-4 font-semibold">{result.confidence}% Confidence</p>
            <p className="italic mb-4">{result.explanation}</p>
            <div className="mb-4">
              <HighlightedText text={newsText} keywords={result.highlightedKeywords} />
            </div>
            <SourceList sources={result.sources} />
          </div>
        )}
      </div>
    </div>
  );
}
