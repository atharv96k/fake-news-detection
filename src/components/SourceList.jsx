import { ExternalLink } from 'lucide-react';

export default function SourceList({ sources }) {
  return (
    <div className="space-y-4">
      {sources.map((source, index) => (
        <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
          <div className="flex-1">
            <a 
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              {source.title}
              <ExternalLink size={14} />
            </a>
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{source.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

