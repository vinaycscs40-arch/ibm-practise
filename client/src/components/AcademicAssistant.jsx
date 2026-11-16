import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageSquare, Send } from 'lucide-react';

const SUBJECTS = [
  'General',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Economics',
  'Literature',
  'Engineering',
  'Other',
];

export default function AcademicAssistant() {
  const [subject, setSubject]   = useState('General');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question.');
      return;
    }
    setLoading(true);
    setAnswer('');
    try {
      const { data } = await axios.post('/api/ask', { question, subject });
      setAnswer(data.answer);
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
          <MessageSquare size={18} color="var(--accent)" />
          <span className="card-title">Academic Assistant</span>
        </div>
        <p className="card-subtitle">
          Ask any academic question and get a clear, structured explanation.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">Subject Area</label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="question">Your Question</label>
            <textarea
              id="question"
              placeholder="e.g. Explain the concept of Big O notation with examples."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Thinking…</> : <><Send size={15} /> Ask</>}
          </button>
        </form>

        {answer && (
          <div className="result-box">
            <div className="result-label">
              <MessageSquare size={12} /> Answer
            </div>
            <pre className="result-text">{answer}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
