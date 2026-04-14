const RUBRICS_KEY = 'scorecard_rubrics';
const HISTORY_KEY = 'scorecard_history';

export function saveRubric(rubric) {
  const rubrics = loadRubrics();
  const existing = rubrics.findIndex(r => r.id === rubric.id);
  if (existing >= 0) {
    rubrics[existing] = rubric;
  } else {
    rubrics.push(rubric);
  }
  localStorage.setItem(RUBRICS_KEY, JSON.stringify(rubrics));
}

export function loadRubrics() {
  try {
    return JSON.parse(localStorage.getItem(RUBRICS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteRubric(id) {
  const rubrics = loadRubrics().filter(r => r.id !== id);
  localStorage.setItem(RUBRICS_KEY, JSON.stringify(rubrics));
}

export function saveScoreEntry(entry) {
  const history = loadScoreHistory();
  history.push({ ...entry, timestamp: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadScoreHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearScoreHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
