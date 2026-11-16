import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ListChecks, Plus, Trash2, Wand2 } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const EMPTY_TASK = { name: '', deadline: '', difficulty: 'Medium' };

export default function TaskPrioritizer() {
  const [tasks, setTasks]     = useState([{ ...EMPTY_TASK }]);
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);

  const updateTask = (index, field, value) => {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const addTask = () => setTasks((prev) => [...prev, { ...EMPTY_TASK }]);

  const removeTask = (index) => setTasks((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = tasks.filter((t) => t.name.trim() && t.deadline);
    if (filled.length === 0) {
      toast.error('Add at least one task with a name and deadline.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const { data } = await axios.post('/api/prioritize', { tasks: filled });
      setResult(data.result);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Check the backend.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ListChecks size={18} color="var(--accent)" />
          <span className="card-title">AI Task Prioritizer</span>
        </div>
        <p className="card-subtitle">
          Add your tasks with deadlines and difficulty. AI will rank them by urgency and importance.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Column headings */}
          <div className="task-row" style={{ borderBottom: '2px solid var(--border)', paddingBottom: 6, marginBottom: 4 }}>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Name</span>
            <span style={{ width: 140, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deadline</span>
            <span style={{ width: 100, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Difficulty</span>
            <span style={{ width: 32 }} />
          </div>

          {tasks.map((task, i) => (
            <div key={i} className="task-row">
              <input
                type="text"
                placeholder="e.g. Write essay"
                value={task.name}
                onChange={(e) => updateTask(i, 'name', e.target.value)}
              />
              <input
                type="date"
                style={{ width: 140 }}
                value={task.deadline}
                onChange={(e) => updateTask(i, 'deadline', e.target.value)}
              />
              <select
                style={{ width: 100 }}
                value={task.difficulty}
                onChange={(e) => updateTask(i, 'difficulty', e.target.value)}
              >
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeTask(i)}
                disabled={tasks.length === 1}
                title="Remove task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="button" className="btn btn-secondary" onClick={addTask}>
              <Plus size={15} /> Add Task
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Prioritizing…</> : <><Wand2 size={15} /> Prioritize with AI</>}
            </button>
          </div>
        </form>

        {result && (
          <div className="result-box">
            <div className="result-label">
              <ListChecks size={12} /> Priority Ranking
            </div>
            <pre className="result-text">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
