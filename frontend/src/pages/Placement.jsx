import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Briefcase, 
  Target, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Award,
  Layers,
  Code,
  Database,
  Brain,
  MessageSquare
} from 'lucide-react';

export const Placement = () => {
  const [goal, setGoal] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchPlacementData = async () => {
    try {
      const res = await api.get('/placement');
      setGoal(res.data.goal);
      setTopics(res.data.topics);
    } catch (err) {
      console.error('Failed to load placement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const handleToggleTopicStatus = async (topic) => {
    const nextStatus = topic.status === 'Completed' ? 'Not Started' : (topic.status === 'Not Started' ? 'In Progress' : 'Completed');
    try {
      await api.patch(`/placement/topic/${topic.id}`, { status: nextStatus });
      fetchPlacementData();
    } catch (err) {
      console.error('Failed to update topic status:', err);
    }
  };

  const categories = ['All', 'DSA', 'Core', 'Aptitude', 'Interview'];

  const filteredTopics = topics.filter(t => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'DSA': return Code;
      case 'Core': return Database;
      case 'Aptitude': return Brain;
      case 'Interview': return MessageSquare;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Target Role & Progress Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Placement Agent Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Placement Preparation Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Target Role: <span className="text-indigo-400 font-bold">{goal?.target_role || 'Software Development Engineer'}</span> • Timeline: 4 Weeks
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-4 shrink-0">
            <div className="relative flex items-center justify-center w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  className="text-purple-500 transition-all duration-500" 
                  fill="transparent"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * (goal?.overall_progress || 0)) / 100}
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-100">{goal?.overall_progress || 0}%</span>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-100">Overall Readiness</span>
              <p className="text-xs text-slate-400">4-Week Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4-Week Roadmap Topics Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading placement roadmap...</div>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((weekNum) => {
            const weekTopics = filteredTopics.filter(t => t.week_number === weekNum);
            if (weekTopics.length === 0) return null;

            return (
              <div key={weekNum} className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                    Week {weekNum}
                  </span>
                  <h3 className="text-sm font-bold text-slate-300">
                    {weekNum === 1 ? 'DSA Foundations & Aptitude' : weekNum === 2 ? 'Core CS & Stacks/Queues' : weekNum === 3 ? 'Advanced DSA & Networks' : 'Interview & Resume Prep'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weekTopics.map((topic) => {
                    const CatIcon = getCategoryIcon(topic.category);
                    const isDone = topic.status === 'Completed';
                    const isInProg = topic.status === 'In Progress';

                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleToggleTopicStatus(topic)}
                        className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer hover:border-purple-500/50 flex items-center justify-between ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                            : isInProg 
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' 
                            : 'border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-purple-400 border border-slate-800'
                          }`}>
                            <CatIcon className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{topic.category}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100">{topic.topic_name}</h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                            isDone ? 'bg-emerald-500/20 text-emerald-300' : isInProg ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {topic.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
