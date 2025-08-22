import { useState } from "react";
import { ExternalLink, ChevronDown, AlertTriangle } from "lucide-react";

export default function SourceList({ sources, onVisitSource }) {
  const [expandedSource, setExpandedSource] = useState(null);

  return (
    <div className="space-y-4">
      {sources.map((src, index) => (
        <div
          key={index}
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

          {expandedSource === index && (
            <div className="p-4 space-y-3 bg-white animate-fadeIn">
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
          )}
        </div>
      ))}
    </div>
  );
}
