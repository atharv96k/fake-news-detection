import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown, AlertTriangle } from "lucide-react";

export default function SourceList({ sources, onVisitSource }) {
  const [expandedSource, setExpandedSource] = useState(null);

  return (
    <div className="space-y-4">
      {sources.map((src, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <button
            onClick={() => setExpandedSource(expandedSource === index ? null : index)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
          >
            <span className="font-semibold text-gray-800">{src.title}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${expandedSource === index ? "rotate-180" : ""}`}
            />
          </button>

          {/* ✅ Animate the expansion */}
          <AnimatePresence initial={false}>
            {expandedSource === index && (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 bg-white">
                  <p className="text-sm text-gray-700">
                    <strong>Summary:</strong> {src.summary}
                  </p>
                  <button
                    onClick={() => onVisitSource(src.url)}
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                  >
                    <AlertTriangle size={14} className="mr-1 text-yellow-600" />
                    Visit Source
                    <ExternalLink size={14} className="ml-1" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
