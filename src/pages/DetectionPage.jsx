import { useState, useRef } from 'react';
import VerdictBadge from '../components/VerdictBadge';
import HighlightedText from '../components/HighlightedText';
import SourceList from '../components/SourceList';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Globe, Waypoints, Search, Trophy, Shield, CheckCircle, AlertCircle, Info } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Fact Check Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Verify news claims with AI-powered analysis
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-8 shadow-sm"
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter News Headline
          </label>
          <textarea
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
            placeholder="Paste your news headline, article excerpt, or URL here to verify its authenticity..."
            disabled={isLoading}
          />

          {!isLoading ? (
            <button
              onClick={checkNews}
              disabled={!newsText.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition-all font-semibold text-lg shadow-md hover:shadow-lg"
            >
              <Search size={22} /> Analyze News
            </button>
          ) : (
            <div className="w-full bg-blue-500 text-white py-4 rounded-xl mt-4 flex items-center justify-center gap-3 animate-pulse font-semibold text-lg">
              {steps[currentStep].icon}
              {steps[currentStep].text}
            </div>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Empty State - Before Analysis */}
        {!result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How It Works
              </h2>
              <p className="text-gray-600">
                Our AI analyzes your text against trusted sources in seconds
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  icon: <CheckCircle className="w-8 h-8 text-green-500" />, 
                  title: "True News", 
                  desc: "Verified by credible sources" 
                },
                { 
                  icon: <AlertCircle className="w-8 h-8 text-red-500" />, 
                  title: "Fake News", 
                  desc: "Contradicted by evidence" 
                },
                { 
                  icon: <Info className="w-8 h-8 text-yellow-500" />, 
                  title: "Unverified", 
                  desc: "Insufficient information" 
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                  <div className="flex justify-center mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                What You'll Get:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Credibility score with confidence percentage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Detailed explanation of the verdict</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Top 3 verified sources with summaries</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Final Results with Animation */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
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
                className="mb-4 font-semibold text-gray-700 text-xl"
              >
                {result.confidence}% Confidence
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="italic mb-6 text-gray-600 leading-relaxed text-lg"
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