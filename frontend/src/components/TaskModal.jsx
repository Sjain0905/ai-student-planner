import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, onSave, task = null, subjects = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject_name: 'DBMS',
    estimated_hours: 2,
    priority: 'High',
    deadline: '',
    description: '',
    trigger_replan: true // Auto trigger dynamic replanning option!
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        subject_name: task.subject?.name || 'DBMS',
        estimated_hours: task.estimated_hours || 2,
        priority: task.priority || 'High',
        deadline: task.deadline ? task.deadline.substring(0, 16) : '',
        description: task.description || '',
        trigger_replan: false
      });
    } else {
      setFormData({
        title: '',
        subject_name: 'DBMS',
        estimated_hours: 2,
        priority: 'High',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
        description: '',
        trigger_replan: true
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              {task ? 'Edit Academic Task' : 'Add New Task / Assignment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DBMS Assignment due tomorrow"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={formData.subject_name}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="DBMS">DBMS</option>
                <option value="DSA">DSA</option>
                <option value="OS">OS</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="General Academic">General Academic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="High">High Priority 🔥</option>
                <option value="Medium">Medium Priority ⚡</option>
                <option value="Low">Low Priority ☕</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Est. Duration (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {!task && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start space-x-3">
              <input
                type="checkbox"
                id="trigger_replan"
                checked={formData.trigger_replan}
                onChange={(e) => setFormData({ ...formData, trigger_replan: e.target.checked })}
                className="mt-1 w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
              />
              <label htmlFor="trigger_replan" className="text-xs text-indigo-200 cursor-pointer">
                <span className="font-semibold text-indigo-300">Trigger Dynamic Replanning (Study & Task Agent)</span>
                <p className="text-slate-400 mt-0.5">
                  Automatically recalculate today's study schedule to accommodate this new deadline.
                </p>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
