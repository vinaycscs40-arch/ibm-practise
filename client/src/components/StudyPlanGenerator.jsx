import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BookOpen, Wand2 } from 'lucide-react';

const DEFAULT = { subject: '', examDate: '', hoursPerDay: '2' };

export default function StudyPlanGenerator() {
  const [form, setForm]     = useState(DEFAULT);
  const [plan, setPlan]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.examDate) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setPlan('');
    try {
      const { data } = await axios.post('/api/study-plan', form);
      setPlan(data.plan);
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
          <BookOpen size={18} color="var(--accent)" />
          <span className="card-title">AI Study Plan Generator</span>
        </div>
        <p className="card-subtitle">
          Enter your subject and exam details to generate a personalised study schedule.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">Subject / Topic</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="e.g. Data Structures, Organic Chemistry"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="examDate">Exam Date</label>
              <input
                id="examDate"
                name="examDate"
                type="date"
                value={form.examDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hoursPerDay">Hours Available per Day</label>
              <select
                id="hoursPerDay"
                name="hoursPerDay"
                value={form.hoursPerDay}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Generating…</> : <><Wand2 size={15} /> Generate Study Plan</>}
          </button>
        </form>

        {plan && (
          <div className="result-box">
            <div className="result-label">
              <BookOpen size={12} /> Study Plan
            </div>
            <pre className="result-text">{plan}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
