import { XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerdictBadge({ verdict }) {
  // ✅ Normalize API verdict to badge keys
  const normalizedVerdict = (() => {
    if (!verdict) return 'uncertain';
    const v = verdict.toString().toLowerCase();
    if (v === 'fake' || v === 'false') return 'fake';
    if (v === 'real' || v === 'true') return 'real';
    return 'uncertain';
  })();

  const badges = {
    fake: { bg: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Likely Fake' },
    real: { bg: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Likely Real' },
    uncertain: { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle, text: 'Uncertain' }
  };

  const badge = badges[normalizedVerdict];
  const IconComponent = badge.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${badge.bg} font-medium`}>
      <IconComponent size={16} />
      {badge.text}
    </div>
  );
}
