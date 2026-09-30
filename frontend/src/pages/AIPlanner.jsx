import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ReplanExplanationModal } from '../components/ReplanExplanationModal';
import { 
  Calendar, 
  Sparkles, 
  RotateCw, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Plus
} from 'lucide-react';

export const AIPlanner = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replanning, setReplanning] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const fetchTodaySchedule = async () => {
    try {
      const res = await api.get('/planner/today');
      setSchedule(res.data);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const handleReplanSchedule = async () => {
    setReplanning(true);
    try {
      const res = await api.post('/planner/replan', {
        new_task_title: 'DBMS Assignment (Due Tomorrow)',
        new_task_subject: 'DBMS',
        new_task_priority: 'High',
        new_task_hours: 2.0,
        reason: 'Student added DBMS assignment due tomorrow'
      });
      setSchedule(res.data);
      setIsExplanationOpen(true);
    } catch (err) {
      console.error('Failed to replan schedule:', err);
    } finally {
      setReplanning(false);
    }
  };

  const handleGeneratePlan = async () => {
    setReplanning(true);
    try {
      const res = await api.post('/planner/replan');
      setSchedule(res.data);
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setReplanning(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Study & Task Agent Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Today's AI Study Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic timeline optimized for your study capacity, subject priority, and urgent deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGeneratePlan}
            disabled={replanning}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center space-x-2"
          >
            <RotateCw className={`w-4 h-4 text-indigo-400 ${replanning ? 'animate-spin' : ''}`} />
            <span>Generate Plan</span>
          </button>

          <button
            onClick={handleReplanSchedule}
            disabled={replanning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 animate-pulse-glow"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{replanning ? 'Replanning Schedule...' : 'Replan Schedule (Dynamic)'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Change Banner & Explanation Trigger */}
      {schedule?.replan_explanation && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Dynamic Schedule Updated
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                {schedule.replan_explanation}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExplanationOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold shrink-0 flex items-center space-x-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Why was my schedule changed?</span>
          </button>
        </div>
      )}

      {/* Legend Badges */}
      <div className="flex items-center space-x-4 text-xs font-medium text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <span className="text-slate-300 font-bold uppercase text-[10px]">Change Status:</span>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-300 font-semibold">Added</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-amber-300 font-semibold">Moved</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-indigo-300 font-semibold">Unchanged</span>
        </div>
      </div>

      {/* Timeline Schedule Section */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Calculating optimal study slots...</div>
      ) : schedule?.items && schedule.items.length > 0 ? (
        <div className="relative space-y-4 before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-slate-800">
          {schedule.items.map((item, index) => {
            const isAdded = item.change_type === 'added';
            const isMoved = item.change_type === 'moved';

            return (
              <div 
                key={item.id || index}
                className={`relative pl-14 transition-all duration-300`}
              >
                {/* Timeline Node Point */}
                <div className={`absolute left-6 top-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-slate-950 z-10 ${
                  isAdded 
                    ? 'border-emerald-400 bg-emerald-400 shadow-lg shadow-emerald-500/50' 
                    : isMoved 
                    ? 'border-amber-400 bg-amber-400 shadow-lg shadow-amber-500/50' 
                    : 'border-indigo-500 bg-indigo-500'
                }`} />

                {/* Card */}
                <div className={`glass-card p-5 rounded-2xl border transition-all ${
                  isAdded 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100 shadow-xl shadow-emerald-500/10' 
                    : isMoved 
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-100 shadow-xl shadow-amber-500/10' 
                    : 'border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300">
                          {item.subject || 'GENERAL'}
                        </span>

                        {isAdded && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                            🔥 High Urgency Added
                          </span>
                        )}

                        {isMoved && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ⚡ Rescheduled Slot
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                      
                      {isMoved && item.original_time_slot && (
                        <p className="text-xs text-amber-300/80 font-medium">
                          Shifted from previous slot ({item.original_time_slot}) to prevent deadline conflict.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 sm:text-right shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-indigo-300 flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.start_time} - {item.end_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium">No study sessions configured for today.</p>
        </div>
      )}

      {/* Modal Explanation */}
      <ReplanExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        explanation={schedule?.replan_explanation}
        scheduleItems={schedule?.items || []}
      />
    </div>
  );
};
