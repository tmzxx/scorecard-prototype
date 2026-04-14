import { useState, useEffect } from 'react';
import { loadRubrics, saveScoreEntry } from '../lib/storage';
import { scoreConversation } from '../lib/claude';
import ScorecardOutput from './ScorecardOutput';

const SAMPLE_TRANSCRIPT = `AGENT: Hi there! Thanks for reaching out. How can I help you today?

CUSTOMER: I've been trying to cancel my subscription for three weeks. Nobody has helped me and I'm still being charged.

AGENT: I'm sorry to hear that. Let me look into this for you. Can you confirm your account email?

CUSTOMER: It's sarah@example.com. I've called twice already.

AGENT: I can see your account. It looks like the cancellation request wasn't processed. I can do that now for you.

CUSTOMER: Will I get a refund for this month?

AGENT: Company policy says we don't offer refunds for the current billing period. Is there anything else I can help with?

CUSTOMER: That's unacceptable. I want to speak to a manager.

AGENT: I understand. I'll escalate this for you now.`;

export default function ConversationScorer() {
  const [rubrics, setRubrics] = useState([]);
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = loadRubrics();
    setRubrics(saved);
    if (saved.length > 0) setSelectedRubricId(saved[0].id);
  }, []);

  const selectedRubric = rubrics.find(r => r.id === selectedRubricId);

  async function handleScore() {
    if (!selectedRubric || !transcript.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const scored = await scoreConversation(selectedRubric, transcript.trim(), contextNotes.trim());
      setResult(scored);
      saveScoreEntry({
        rubricId: selectedRubric.id,
        rubricName: selectedRubric.name,
        overallScore: scored.overallScore,
        criteria: scored.criteria.map(c => ({ name: c.name, score: c.score, pass: c.pass })),
      });
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Score a Conversation</h2>
        <p className="text-sm text-gray-500 mb-6">Paste a transcript and select a rubric — Claude will evaluate it against each criterion</p>

        {rubrics.length === 0 ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            No rubrics saved yet. Go to <strong>Rubric Builder</strong> to create one first.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Rubric selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Rubric</label>
              <select
                value={selectedRubricId}
                onChange={e => setSelectedRubricId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {rubrics.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.criteria.length} criteria)</option>
                ))}
              </select>
              {selectedRubric && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRubric.criteria.map(c => (
                    <span key={c.id} className={`px-2 py-0.5 rounded text-xs font-medium ${c.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.name}{c.priority === 'high' ? ' ★' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Transcript */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Conversation Transcript</label>
                <button
                  onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Load sample transcript
                </button>
              </div>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Paste the agent conversation transcript here..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
              />
            </div>

            {/* Context notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Context Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={contextNotes}
                onChange={e => setContextNotes(e.target.value)}
                placeholder="e.g. Regulated market, first-time customer, high-value account"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              onClick={handleScore}
              disabled={loading || !transcript.trim() || !selectedRubric}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Evaluating with Claude...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Score Conversation
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {result && <ScorecardOutput result={result} rubricName={selectedRubric?.name} />}
    </div>
  );
}
