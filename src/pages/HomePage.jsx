import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import trustedSources from "../data/trustedSources.js";
import heroImg from "/icons/hero_news.svg"; // news illustration
import newsInputIcon from "/icons/news-input.svg";
import aiAnalysisIcon from "/icons/ai-analysis.svg";
import verdictIcon from "/icons/verdict.svg";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        className="text-center py-20 px-6 relative"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Fake News Detection Platform
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Detect fake news instantly, get credibility scores, and learn to identify misinformation like a pro.
        </p>
        <img src={heroImg} alt="Hero illustration" className="mx-auto mt-10 w-80" />

        <div className="flex justify-center space-x-4 mt-8">
          <Link 
            to="/detection" 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Detecting
          </Link>
          <Link 
            to="/sources" 
            className="px-6 py-3 bg-white border border-gray-300 rounded-xl shadow hover:shadow-md transition-all"
          >
            View Sources
          </Link>
        </div>
      </motion.section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {[
          { icon: newsInputIcon, title: "1. Enter News", desc: "Paste a headline or URL into our detection system." },
          { icon: aiAnalysisIcon, title: "2. AI Analysis", desc: "We cross-check facts using trusted sources powered by Perplexity API." },
          { icon: verdictIcon, title: "3. Get Verdict", desc: "Receive a credibility score, confidence percentage, and source list." },
        ].map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-all text-center"
          >
            <img src={step.icon} alt={step.title} className="h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-gray-600 mt-2">{step.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Trusted Sources */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Trusted Sources</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {trustedSources.map((src, i) => (
            <motion.a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-2xl shadow hover:shadow-lg flex flex-col items-center text-center"
            >
              <img src={src.logo} alt={src.name} className="h-12 mb-2" />
              <h3 className="text-lg font-semibold">{src.name}</h3>
              <p className="text-gray-500 text-sm">{src.type}</p>
            </motion.a>
          ))}
        </div>
      </section>

    </div>
  );
}
