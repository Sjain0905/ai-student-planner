import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, BookOpen, Clock, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Onboarding = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    branch: 'Computer Science & Engineering',
    semester: 6,
    subjects_list: ['DSA', 'DBMS', 'OS', 'Computer Networks'],
    available_study_hours: 4.0,
    preferred_study_time: 'Evening',
    placement_target: 'Software Development Engineer',
    skill_levels: {
      DSA: 'Intermediate',
      DBMS: 'Beginner',
      OS: 'Beginner',
      Aptitude: 'Intermediate'
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/profile', formData);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Student Success Agent Initialization</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome, {user?.full_name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-400">
            Configure your academic profile & placement goals so our Multi-Agent AI system can tailor your study schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
          
          {/* Academic Profile */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <BookOpen className="w-4 h-4" />
              <span>1. Academic Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Branch</label>
                <input
                  type="text"
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Study Routine */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <Clock className="w-4 h-4" />
              <span>2. Daily Study Routine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Daily Available Hours</label>
                <select
                  value={formData.available_study_hours}
                  onChange={(e) => setFormData({ ...formData, available_study_hours: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 Hours / Day</option>
                  <option value={4}>4 Hours / Day</option>
                  <option value={6}>6 Hours / Day</option>
                  <option value={8}>8 Hours / Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Study Window</label>
                <select
                  value={formData.preferred_study_time}
                  onChange={(e) => setFormData({ ...formData, preferred_study_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Morning">Morning (8 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (2 PM - 6 PM)</option>
                  <option value="Evening">Evening (5 PM - 9 PM)</option>
                  <option value="Night">Night (8 PM - 12 AM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Placement Goals */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <Target className="w-4 h-4" />
              <span>3. Placement Target & Skills</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Placement Role</label>
              <select
                value={formData.placement_target}
                onChange={(e) => setFormData({ ...formData, placement_target: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
                <option value="Backend Engineer">Backend Engineer (Node/Python/Java)</option>
                <option value="Fullstack Developer">Fullstack Web Developer (React + Node/Python)</option>
                <option value="Data Engineer / AI Engineer">Data Engineer / AI Engineer</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 transition-all duration-200 hover:scale-[1.01]"
          >
            <span>{loading ? 'Initializing AI Agents...' : 'Complete Onboarding & Launch Agent'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
