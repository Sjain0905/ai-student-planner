import React from 'react';
import { X, Sparkles, Zap, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const ReplanExplanationModal = ({ isOpen, onClose, explanation, scheduleItems = [] }) => {
  if (!isOpen) return null;

  const addedItems = scheduleItems.filter(i => i.change_type === 'added');
  const movedItems = scheduleItems.filter(i => i.change_type === 'moved');
  const unchangedItems = scheduleItems.filter(i => i.change_type === 'unchanged');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Why was my schedule changed?
              </h3>
              <p className="text-xs text-indigo-400 font-medium">
                Study & Task Agent Dynamic Replanning Explanation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Explanation Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>Agentic AI Reasoning</span>
          </div>
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {explanation || "Your schedule was automatically optimized by prioritizing urgent deadlines and moving routine tasks to open study windows."}
          </div>
        </div>

        {/* Dynamic Changes Summary Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Schedule Impact Breakdown
          </h4>

          <div className="grid grid-cols-3 gap-3">
            {/* Added */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-2xl font-bold text-emerald-400">{addedItems.length}</span>
              <p className="text-[11px] font-semibold text-emerald-300 mt-0.5">High Priority Added</p>
            </div>

            {/* Moved */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-2xl font-bold text-amber-400">{movedItems.length}</span>
              <p className="text-[11px] font-semibold text-amber-300 mt-0.5">Shifted Slots</p>
            </div>

            {/* Unchanged */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center">
              <span className="text-2xl font-bold text-slate-300">{unchangedItems.length}</span>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Kept Unchanged</p>
            </div>
          </div>
        </div>

        {/* Moved Items Detail List */}
        {movedItems.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-300">Rescheduled Sessions:</h5>
            {movedItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-semibold text-amber-200">{item.title}</span>
                <div className="flex items-center space-x-2 text-amber-400 font-mono">
                  <span className="line-through text-slate-500">{item.original_time_slot || '05:00 PM'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="font-bold text-amber-300">{item.start_time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
          >
            Got it, looks good!
          </button>
        </div>

      </div>
    </div>
  );
};
