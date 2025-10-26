import { useState, useRef } from 'react';
import VerdictBadge from '../components/VerdictBadge';
import HighlightedText from '../components/HighlightedText';
import SourceList from '../components/SourceList';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Globe, Waypoints, Search, Trophy, Shield } from "lucide-react";

export default function DetectionPage() {
  const [newsText, setNewsText] = useState('');
  const [analyzedText, setAnalyzedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const steps = [
    { text: "Processing Text", icon: <FileText className="w-5 h-5 text-white-500" /> },
    { text: "Fetching Evidence", icon: <Globe className="w-5 h-5 text-white-500" /> },
    { text: "AI Analysis", icon: <Waypoints className="w-5 h-5 text-white-500" /> },
    { text: "Final Verdict", icon: <Trophy className="w-5 h-5 text-white-500" /> },
  ];

  const ANIMATION_DURATION = steps.length * 1200;

  const checkNews = async () => {
    if (!newsText.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    setCurrentStep(0);
    setAnalyzedText(newsText);

    const animationStart = Date.now();

    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => (prev + 1 < steps.length ? prev + 1 : prev));
    }, 1600);

    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await fetch(`${API_BASE}/fact-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: newsText }),
      });

      if (!response.ok) throw new Error('Failed to fetch verdict');

      const data = await response.json();

      const elapsed = Date.now() - animationStart;
      if (elapsed < ANIMATION_DURATION) {
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION - elapsed));
      }

      setResult({
        verdict: data.verdict.toLowerCase(),
        confidence: data.confidence_percentage,
        explanation: data.explanation ||
          (data.verdict.toLowerCase() === 'fake'
            ? 'Independent fact-checking confirms this claim is false based on multiple credible sources.'
            : data.verdict.toLowerCase() === 'true'
              ? 'This claim is likely true according to verified sources.'
              : 'This claim could not be verified with high certainty.'),
        sources: data.top_3_sources.map(src => ({
          title: src.title,
          url: src.url && src.url.startsWith('http') ? src.url : `https://${src.url}`,
          summary: src.summary || "No AI summary available."
        })),
        highlightedKeywords: newsText.split(' ').filter(word => word.length > 6),
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
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-blue-500" />
            Fact Check Tool
          </h1>
          <p className="text-md text-gray-600">
            Verify news with AI-powered analysis
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <textarea
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Paste your news headline or article here..."
            disabled={isLoading}
          />

          {!isLoading ? (
            <button
              onClick={checkNews}
              disabled={!newsText.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <Search size={20} /> Analyze News
            </button>
          ) : (
            <div className="w-full bg-blue-500 text-white py-3 rounded-lg mt-4 flex items-center justify-center gap-3 animate-pulse font-medium">
              {steps[currentStep].icon}
              {steps[currentStep].text}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}



        {/* Final Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center justify-between mb-6"
              >
                <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
                <VerdictBadge verdict={result.verdict} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-4 font-semibold text-gray-700"
              >
                {result.confidence}% Confidence
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="italic mb-6 text-gray-600 leading-relaxed"
              >
                {result.explanation}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mb-6"
              >
                <HighlightedText text={analyzedText} keywords={result.highlightedKeywords} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <SourceList
                  sources={result.sources}
                  onVisitSource={(url) => window.open(url, "_blank", "noopener,noreferrer")}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}