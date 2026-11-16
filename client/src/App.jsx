import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import StudyPlanGenerator from './components/StudyPlanGenerator';
import TaskPrioritizer from './components/TaskPrioritizer';
import AcademicAssistant from './components/AcademicAssistant';
import ProgressTracker from './components/ProgressTracker';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'study-plan', label: 'Study Planner', icon: BookOpen },
  { id: 'tasks', label: 'Task Priority', icon: ListChecks },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':    return <Dashboard onNavigate={setActiveTab} />;
      case 'study-plan':   return <StudyPlanGenerator />;
      case 'tasks':        return <TaskPrioritizer />;
      case 'assistant':    return <AcademicAssistant />;
      case 'progress':     return <ProgressTracker />;
      default:             return null;
    }
  };

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header">
        <h1>
          🎓 <span>Smart Student Assistant</span>
        </h1>
        <span className="ibm-badge">Powered by IBM Granite</span>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="app-nav">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <main className="app-main">
        {renderTab()}
      </main>

      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar />
    </div>
  );
}
