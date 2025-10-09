import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import step1 from "/icons/step1.png"; 
import step2 from "/icons/step2.png";
import step3 from "/icons/step3.png";

export default function FirefoxExtensionPage() {
  const steps = [
    {
      icon: step1,
      title: "1. Highlight Any News",
      desc: "Select any news text or headline while browsing.",
    },
    {
      icon: step2,
      title: "2. Right-Click → Fact Check",
      desc: "Choose ‘Fact-check with AI’ from the context menu.",
    },
    {
      icon: step3,
      title: "3. Get Instant Verdict",
      desc: "See AI-powered verdict: True, False, or Mixed with sources.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
       
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold text-center text-gray-900"
      >
        🦊 Enhance Your Browsing with 
        <br />
        <span className="text-blue-500 pt-6">Instant Fact-Checks</span>
      </motion.h1>
 
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-gray-600 text-center mt-4 max-w-2xl mx-auto leading-relaxed"
      >Say goodbye to misinformation. Our Firefox Extension lets you check 
        credibility instantly without leaving the page — fast, reliable, and simple.
      </motion.p>
 
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow"
          >
            <motion.img
              src={step.icon}
              alt={step.title}
              className="w-60 h-40 mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
            <p className="text-gray-600">{step.desc}</p>
          </motion.div>
        ))}
      </div>

 
      <div className="text-center mt-16">
        <motion.a
          href="https://addons.mozilla.org/en-US/firefox/addon/fake-news-detection-1-0/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-lg transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 Add to Firefox
        </motion.a>
      </div>

      <div className="text-center mt-8">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-blue-500 font-medium hover:bg-gray-100 transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
