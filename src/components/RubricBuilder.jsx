import { useState, useEffect } from 'react';
import { TEMPLATES } from '../lib/templates';
import { saveRubric, loadRubrics, deleteRubric } from '../lib/storage';

const EMPTY_CRITERION = () => ({ id: crypto.randomUUID(), name: '', description: '', priority: 'standard' });

export default function RubricBuilder() {
  const [rubrics, setRubrics] = useState([]);
  const [rubricName, setRubricName] = useState('');
  const [criteria, setCriteria] = useState([EMPTY_CRITERION()]);
  const [editingId, setEditingId] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRubrics(loadRubrics());
  }, []);

  function applyTemplate(template) {
    setRubricName(template.name);
    setCriteria(template.criteria.map(c => ({ ...c, id: crypto.randomUUID() })));
    setEditingId(null);
  }

  function addCriterion() {
    if (criteria.length >= 8) return;
    setCriteria([...criteria, EMPTY_CRITERION()]);
  }

  function updateCriterion(id, field, value) {
    setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  function removeCriterion(id) {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter(c => c.id !== id));
  }

  function handleSave() {
    if (!rubricName.trim() || criteria.some(c => !c.name.trim())) return;
    const rubric = {
      id: editingId || crypto.randomUUID(),
      name: rubricName.trim(),
      criteria: criteria.filter(c => c.name.trim()),
      createdAt: editingId ? undefined : new Date().toISOString(),
    };
    saveRubric(rubric);
    setRubrics(loadRubrics());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (!editingId) resetForm();
  }

  function handleEdit(rubric) {
    setEditingId(rubric.id);
    setRubricName(rubric.name);
    setCriteria(rubric.criteria.map(c => ({ ...c, id: c.id || crypto.randomUUID() })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(id) {
    deleteRubric(id);
    setRubrics(loadRubrics());
    if (editingId === id) resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setRubricName('');
    setCriteria([EMPTY_CRITERION()]);
  }

  const canSave = rubricName.trim() && criteria.every(c => c.name.trim());

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Rubric' : 'New Rubric'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Define the criteria your AI agent will be evaluated against</p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Cancel edit
            </button>
          )}
        </div>

        {/* Templates */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Start from a template</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Rubric name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rubric Name</label>
          <input
            type="text"
            value={rubricName}
            onChange={e => setRubricName(e.target.value)}
            placeholder="e.g. Q3 Financial Services QA"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Criteria */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Evaluation Criteria <span className="text-gray-400 font-normal">({criteria.length}/8)</span></p>
          </div>
          {criteria.map((c, i) => (
            <div key={c.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-2 text-xs font-semibold text-gray-400 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={c.name}
                      onChange={e => updateCriterion(c.id, 'name', e.target.value)}
                      placeholder="Criterion name (e.g. Empathy)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <select
                      value={c.priority}
                      onChange={e => updateCriterion(c.id, 'priority', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="standard">Standard</option>
                      <option value="high">High Priority</option>
                    </select>
                    {criteria.length > 1 && (
                      <button
                        onClick={() => removeCriterion(c.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove criterion"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <textarea
                    value={c.description}
                    onChange={e => updateCriterion(c.id, 'description', e.target.value)}
                    placeholder="Describe what 'good' looks like for this criterion..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {criteria.length < 8 && (
            <button
              onClick={addCriterion}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add criterion
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {editingId ? 'Update Rubric' : 'Save Rubric'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Saved rubrics list */}
      {rubrics.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Rubrics</h2>
          <div className="divide-y divide-gray-100">
            {rubrics.map(r => (
              <div key={r.id} className="py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.criteria.length} criteria</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.criteria.map(c => (
                      <span key={c.id} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.name}
                        {c.priority === 'high' && <span className="ml-1 text-orange-500">★</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(r)}
                    className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
