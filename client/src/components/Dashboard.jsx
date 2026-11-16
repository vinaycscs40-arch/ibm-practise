import { BookOpen, ListChecks, MessageSquare, TrendingUp, Zap } from 'lucide-react';

const FEATURES = [
  {
    id: 'study-plan',
    icon: BookOpen,
    colorClass: 'blue',
    title: 'AI Study Planner',
    description: 'Generate a personalized day-by-day study plan powered by IBM Granite.',
  },
  {
    id: 'tasks',
    icon: ListChecks,
    colorClass: 'orange',
    title: 'Task Prioritizer',
    description: 'Let Granite rank your tasks by urgency and difficulty so you focus on what matters.',
  },
  {
    id: 'assistant',
    icon: MessageSquare,
    colorClass: 'purple',
    title: 'Academic Assistant',
    description: 'Ask any academic question and get a clear, structured explanation from Granite.',
  },
  {
    id: 'progress',
    icon: TrendingUp,
    colorClass: 'green',
    title: 'Progress Tracker',
    description: 'Track your tasks, update completion percentage, and monitor your study momentum.',
  },
];

export default function Dashboard({ onNavigate }) {
  return (
    <div>
      {/* Welcome */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Zap size={20} color="var(--accent)" />
          <span className="card-title">Welcome to Smart Student Assistant</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Your AI-powered study companion built on <strong>IBM Granite</strong> via watsonx.ai.
          Use the tabs above to generate study plans, prioritize tasks, ask academic questions,
          and track your progress.
        </p>
      </div>

      {/* Feature cards */}
      <div className="dashboard-grid">
        {FEATURES.map(({ id, icon: Icon, colorClass, title, description }) => (
          <div
            key={id}
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate(id)}
          >
            <div className={`stat-icon ${colorClass}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="stat-label">{title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* IBM Granite info */}
      <div className="card" style={{ marginTop: 16, borderLeft: '3px solid var(--accent)' }}>
        <div className="result-label">
          <Zap size={12} />
          IBM Granite Model
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          All AI features use <strong>ibm/granite-3-8b-instruct</strong> via the watsonx.ai
          REST API. Credentials are configured in <code>server/.env</code>. Requests are
          rate-limited to 10 per minute to stay within free-tier quotas.
        </p>
      </div>
    </div>
  );
}
