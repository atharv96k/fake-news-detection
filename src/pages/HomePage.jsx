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
        <motion.img src={heroImg} alt="Hero illustration" className="mx-auto mt-12 w-80" whileHover={{ scale: 1.1 }} />

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
     {/* working */}
      <section className="max-w-6xl mx-auto px-6 py-20 bg-gray-50">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center"
        >
          How It Works
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-center mb-16 max-w-2xl mx-auto"
        >
          Verify any news article in three simple steps with AI-powered analysis
        </motion.p>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines - hidden on mobile */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent" style={{ top: '5rem' }} />
          
          {[
            { icon: newsInputIcon, title: "Enter News", step: "01", desc: "Paste a headline or URL into our detection system.", color: "blue" },
            { icon: aiAnalysisIcon, title: "AI Analysis", step: "02", desc: "We cross-check facts using trusted sources powered by Perplexity API.", color: "blue" },
            { icon: verdictIcon, title: "Get Verdict", step: "03", desc: "Receive a credibility score, confidence percentage, and source list.", color: "blue" },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 text-center relative overflow-hidden group">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                {/* Step number */}
                <div className="absolute top-4 left-4 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.step}
                </div>
                
                {/* Icon with spark effect */}
                <div className="relative inline-block mt-8 mb-6">
                  <motion.img 
                    src={step.icon} 
                    alt={step.title} 
                    className="h-24 mx-auto relative z-10" 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed relative z-10">{step.desc}</p>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
              
              {/* Arrow connector - hidden on mobile */}
              {i < 2 && (
                <div className="hidden md:block absolute top-20 -right-4 text-blue-400 text-3xl z-20">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
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
              <motion.img src={src.logo} alt={src.name} className="h-12 mb-3" whileHover={{ scale: 1.1, rotate: 5 }} />
              <h3 className="text-lg font-semibold text-gray-900">{src.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{src.type}</p>

            </motion.a>
          ))}
        </div>
      </section>

    </div>
  );
}
