import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';

const STATUSES = ['todo', 'in-progress', 'done', 'blocked'];

const BADGE_CLASS = {
  'todo': 'badge-todo',
  'in-progress': 'badge-in-progress',
  'done': 'badge-done',
  'blocked': 'badge-blocked',
};

const FILL_CLASS = {
  'done': 'done',
  'blocked': 'blocked',
};

const DEFAULT_FORM = { name: '', status: 'todo', percent: 0 };

export default function ProgressTracker() {
  const [tasks, setTasks]     = useState([]);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/progress');
      setTasks(data.tasks);
    } catch {
      toast.error('Could not load tasks from server.');
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'percent' ? Number(value) : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Task name is required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/progress', form);
      setForm(DEFAULT_FORM);
      await fetchTasks();
      toast.success('Task added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add task.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/progress/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Failed to remove task.');
    }
  };

  const done = tasks.filter((t) => t.status === 'done').length;
  const overall = tasks.length
    ? Math.round(tasks.reduce((acc, t) => acc + t.percent, 0) / tasks.length)
    : 0;

  return (
    <div>
      {/* Summary strip */}
      <div className="dashboard-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-label">Overall Progress</div>
            <div className="stat-value">{overall}%</div>
            <div className="stat-desc">{tasks.length} task{tasks.length !== 1 ? 's' : ''} tracked</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{done}</div>
            <div className="stat-desc">of {tasks.length} task{tasks.length !== 1 ? 's' : ''} done</div>
          </div>
        </div>
      </div>

      {/* Add task */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Plus size={18} color="var(--accent)" />
          <span className="card-title">Add / Update Task</span>
        </div>
        <form onSubmit={handleAdd}>
          <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Task Name</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Complete Chapter 5 notes"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Progress %</label>
              <input
                name="percent"
                type="number"
                min="0"
                max="100"
                value={form.percent}
                onChange={handleChange}
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Adding…</> : <><Plus size={15} /> Add Task</>}
            </button>
          </div>
        </form>
      </div>

      {/* Task list */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={18} color="var(--accent)" />
          <span className="card-title">Your Tasks</span>
        </div>

        {tasks.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No tasks yet. Add your first task above.
          </p>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="progress-item">
            <div className="progress-header">
              <span className="progress-name">{task.name}</span>
              <div className="progress-meta">
                <span className={`badge ${BADGE_CLASS[task.status] || 'badge-todo'}`}>
                  {task.status}
                </span>
                <span>{task.percent}%</span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(task.id)}
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${FILL_CLASS[task.status] || ''}`}
                style={{ width: `${task.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
