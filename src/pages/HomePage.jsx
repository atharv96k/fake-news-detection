import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import trustedSources from "../data/trustedSources.js";
import heroImg from "/icons/hero_news.svg";
import newsInputIcon from "/icons/news-input.svg";
import aiAnalysisIcon from "/icons/ai-analysis.svg";
import verdictIcon from "/icons/verdict.svg";
import sparkIcon from "/icons/spark.svg"; 
export default function Homepage() {
  return (
    <div className="min-h-screen bg-gray-50" > 

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-10 px-6 relative bg-white"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Your All-in-One
        </h1>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-2">
          <span className="text-blue-500">AI-Powered Fact Verification</span> Platform
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Verify information instantly, get credibility scores, and learn to identify misinformation like a pro. Boost your media literacy by 10x.
        </p>
        <motion.img src={heroImg} alt="Hero illustration" className="mx-auto mt-12 w-80"  whileHover={{ scale: 1.1 }}/>

        <div className="flex justify-center space-x-4 mt-10">

          {/* Firefox button */}
          <Link
            to="/firefox-extension"
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center space-x-2"
          >
            <span className="text-blue-500">🦊</span>
            <span>Firefox Extension - Free</span>
          </Link>

        </div>
      </motion.section>

      {/* working */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 bg-gray-50">
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
            className="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all text-center"
          >
            <motion.img src={step.icon} alt={step.title} className="h-20 mx-auto mb-6" whileHover={{ scale: 1.1}}/>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </section>

      {/*  Sources */}
      <section className="max-w-6xl mx-auto px-6 py-16 bg-white">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Trusted Sources</h2>
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
              className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md hover:border-gray-300 flex flex-col items-center text-center transition-all"
            >
              <motion.img src={src.logo} alt={src.name} className="h-12 mb-3" whileHover={{ scale: 1.1, rotate: 5 }}/>
              <h3 className="text-lg font-semibold text-gray-900">{src.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{src.type}</p>
            
            </motion.a>
          ))}
        </div>
      </section>

    </div>
  );
}
