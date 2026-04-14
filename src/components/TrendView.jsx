import { useState, useEffect, useMemo } from 'react';
import { loadScoreHistory, clearScoreHistory } from '../lib/storage';
import { generateTrendSummary } from '../lib/claude';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

function scoreColor(score) {
  if (score >= 4) return '#10b981';
  if (score >= 3) return '#f59e0b';
  return '#ef4444';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{label}</p>
      <p style={{ color: scoreColor(val) }} className="font-bold">Avg score: {val.toFixed(2)}</p>
    </div>
  );
};

export default function TrendView() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    setHistory(loadScoreHistory());
  }, []);

  const criteriaAverages = useMemo(() => {
    if (!history.length) return [];
    const totals = {};
    const counts = {};
    history.forEach(entry => {
      entry.criteria?.forEach(c => {
        totals[c.name] = (totals[c.name] || 0) + c.score;
        counts[c.name] = (counts[c.name] || 0) + 1;
      });
    });
    return Object.entries(totals)
      .map(([name, total]) => ({ name, avg: +(total / counts[name]).toFixed(2) }))
      .sort((a, b) => a.avg - b.avg);
  }, [history]);

  const lowestCriterion = criteriaAverages[0];
  const overallTrend = useMemo(() => {
    if (history.length < 2) return null;
    const scores = history.map(e => e.overallScore);
    const first = scores.slice(0, Math.ceil(scores.length / 2));
    const last = scores.slice(Math.ceil(scores.length / 2));
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgLast = last.reduce((a, b) => a + b, 0) / last.length;
    return avgLast - avgFirst;
  }, [history]);

  async function handleGenerateSummary() {
    setLoadingSummary(true);
    setSummaryError('');
    try {
      const text = await generateTrendSummary(history);
      setSummary(text);
    } catch (e) {
      setSummaryError(e.message || 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  }

  function handleClear() {
    clearScoreHistory();
    setHistory([]);
    setSummary('');
  }

  if (!history.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No evaluations yet. Score some conversations to see trends here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Evaluations</p>
          <p className="text-3xl font-bold text-gray-900">{history.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Overall Avg Score</p>
          <p className="text-3xl font-bold" style={{ color: scoreColor(history.reduce((a, b) => a + b.overallScore, 0) / history.length) }}>
            {(history.reduce((a, b) => a + b.overallScore, 0) / history.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Score Trend</p>
          {overallTrend !== null ? (
            <p className={`text-3xl font-bold ${overallTrend > 0 ? 'text-emerald-600' : overallTrend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {overallTrend > 0 ? '+' : ''}{overallTrend.toFixed(1)}
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Need more data</p>
          )}
        </div>
      </div>

      {/* Lowest performing callout */}
      {lowestCriterion && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">Lowest-performing criterion</p>
            <p className="text-sm text-red-700 mt-0.5">
              <strong>{lowestCriterion.name}</strong> is averaging <strong>{lowestCriterion.avg}/5</strong> across all evaluations — this is your biggest quality gap.
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">Average Score by Criterion</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={criteriaAverages} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#6b7280' }} tickCount={6} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={3} stroke="#d1d5db" strokeDasharray="4 4" label={{ value: 'Pass threshold', position: 'insideTopRight', fontSize: 11, fill: '#9ca3af' }} />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
              {criteriaAverages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={scoreColor(entry.avg)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Evaluation history table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Evaluation History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">#</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Rubric</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Date</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Overall</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...history].reverse().map((entry, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2.5 px-2 text-gray-400">{history.length - i}</td>
                  <td className="py-2.5 px-2 font-medium text-gray-800">{entry.rubricName}</td>
                  <td className="py-2.5 px-2 text-gray-500">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="font-bold" style={{ color: scoreColor(entry.overallScore) }}>{entry.overallScore}/5</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.criteria?.map((c, j) => (
                        <span key={j} className={`px-1.5 py-0.5 rounded text-xs ${c.pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {c.name} {c.score}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI trend summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">AI Trend Analysis</h2>
          <button
            onClick={handleGenerateSummary}
            disabled={loadingSummary}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {loadingSummary ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : 'Generate Summary'}
          </button>
        </div>
        {summaryError && <p className="text-sm text-red-600">{summaryError}</p>}
        {summary ? (
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        ) : (
          <p className="text-sm text-gray-400">Click "Generate Summary" to get an AI-powered analysis of your score trends.</p>
        )}
      </div>

      {/* Clear history */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-red-600 underline transition-colors"
        >
          Clear all history
        </button>
      </div>
    </div>
  );
}
