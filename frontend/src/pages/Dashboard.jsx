import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  Briefcase, 
  Flame, 
  Zap, 
  ArrowRight,
  Clock,
  TrendingUp,
  Bot,
  AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profRes, schedRes, tasksRes, placeRes] = await Promise.all([
        api.get('/profile'),
        api.get('/planner/today'),
        api.get('/tasks?status=Pending'),
        api.get('/placement')
      ]);

      setProfile(profRes.data);
      setSchedule(schedRes.data);
      setTasks(tasksRes.data);
      setPlacement(placeRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const academicProgressPct = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 75;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3 text-indigo-400 font-semibold animate-pulse">
          <Bot className="w-6 h-6 animate-bounce" />
          <span>Synchronizing Agent Systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Top Greeting Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Agent System Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, {user?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {profile?.branch || 'Computer Science'} • Semester {profile?.semester || 6} • Target: <span className="text-indigo-400 font-semibold">{profile?.placement_target || 'Software Engineer'}</span>
            </p>
          </div>

          <Link
            to="/chat"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Coordinator Agent</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{user?.streak || 1} Days</span>
            <p className="text-xs font-medium text-slate-400">Current Streak</p>
          </div>
        </div>

        {/* XP */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-6 h-6 fill-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{user?.xp || 100} XP</span>
            <p className="text-xs font-medium text-slate-400">Academic Score</p>
          </div>
        </div>

        {/* Academic Progress */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{academicProgressPct}%</span>
            <p className="text-xs font-medium text-slate-400">Task Completion</p>
          </div>
        </div>

        {/* Placement Progress */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100">{placement?.goal?.overall_progress || 25}%</span>
            <p className="text-xs font-medium text-slate-400">Placement Ready</p>
          </div>
        </div>
      </div>

      {/* 3. AI Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-start space-x-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Coordinator Agent Recommendation
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {schedule?.replan_explanation || "You have an urgent DBMS assignment upcoming. Study & Task Agent has reserved evening hours for focused execution."}
          </p>
        </div>
      </div>

      {/* 4. Main Grid: Schedule & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Schedule Timeline Preview */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">Today's Schedule</h2>
            </div>
            <Link to="/planner" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
              <span>View Full AI Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {schedule?.items && schedule.items.length > 0 ? (
              schedule.items.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    item.change_type === 'added'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : item.change_type === 'moved'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-800">
                      {item.subject || 'GEN'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.start_time} - {item.end_time}</span>
                      </p>
                    </div>
                  </div>

                  {item.change_type !== 'unchanged' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.change_type === 'added' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.change_type}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No schedule generated yet. Visit AI Planner to create one.</p>
            )}
          </div>
        </div>

        {/* Right Col: Upcoming Tasks */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">Pending Tasks</h2>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Manage Tasks →
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{t.title}</h5>
                    <span className="text-[10px] font-semibold text-indigo-400">{t.subject?.name || 'General'}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    t.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">All tasks completed! Great work.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
