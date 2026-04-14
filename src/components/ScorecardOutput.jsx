function ScoreBadge({ score, large }) {
  const color =
    score >= 4 ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' :
    score === 3 ? 'bg-amber-100 text-amber-700 ring-amber-200' :
    'bg-red-100 text-red-700 ring-red-200';
  return (
    <span className={`inline-flex items-center justify-center font-bold ring-1 rounded-full ${color} ${large ? 'w-14 h-14 text-2xl' : 'w-8 h-8 text-sm'}`}>
      {score}
    </span>
  );
}

function PassFailBadge({ pass }) {
  return pass ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      Pass
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Fail
    </span>
  );
}

export default function ScorecardOutput({ result, rubricName }) {
  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <ScoreBadge score={result.overallScore} large />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Overall Score — {rubricName}</p>
            <p className="text-lg font-semibold text-gray-900">{result.verdict}</p>
            <div className="flex items-center gap-2 mt-2">
              {[1,2,3,4,5].map(n => (
                <div
                  key={n}
                  className={`h-2 flex-1 rounded-full ${n <= result.overallScore
                    ? result.overallScore >= 4 ? 'bg-emerald-400'
                    : result.overallScore === 3 ? 'bg-amber-400'
                    : 'bg-red-400'
                    : 'bg-gray-200'}`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">{result.overallScore} / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-criterion cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Criterion Breakdown</h3>
        {result.criteria.map((c, i) => (
          <div key={i} className={`bg-white rounded-xl border shadow-sm p-5 ${!c.pass ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <ScoreBadge score={c.score} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                </div>
              </div>
              <PassFailBadge pass={c.pass} />
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">{c.reasoning}</p>

            {c.excerpt && (
              <div className="bg-blue-50 border-l-4 border-blue-300 rounded-r-lg px-4 py-2.5 mb-3">
                <p className="text-xs font-medium text-blue-600 mb-1">Key excerpt</p>
                <p className="text-sm text-blue-900 italic">"{c.excerpt}"</p>
              </div>
            )}

            {c.suggestion && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex gap-2">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Improvement suggestion</p>
                  <p className="text-sm text-amber-800">{c.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
