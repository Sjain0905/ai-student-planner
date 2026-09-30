import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TaskModal } from '../components/TaskModal';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Filter
} from 'lucide-react';

export const Tasks = () => {
  const { refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
        if (formData.trigger_replan) {
          // Trigger dynamic replanning endpoint
          await api.post('/planner/replan', {
            new_task_title: formData.title,
            new_task_subject: formData.subject_name,
            new_task_priority: formData.priority,
            new_task_hours: formData.estimated_hours
          });
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      await refreshUser();
      fetchTasks();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleMarkMissed = async (id) => {
    try {
      await api.patch(`/tasks/${id}/missed`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to mark task missed:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'All') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-3">
            <CheckSquare className="w-7 h-7 text-indigo-500" />
            <span>Academic Tasks & Assignments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize, prioritize, and track your coursework with auto-calculated XP rewards.
          </p>
        </div>

        <button
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task / Assignment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['All', 'Pending', 'Completed', 'Missed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {st} ({st === 'All' ? tasks.length : tasks.filter(t => t.status === st).length})
          </button>
        ))}
      </div>

      {/* Tasks Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading academic tasks...</div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`glass-card p-5 rounded-2xl border transition-all duration-200 hover:border-indigo-500/40 space-y-4 flex flex-col justify-between ${
                t.status === 'Completed'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : t.status === 'Missed'
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-2">{t.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                    t.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {t.priority}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold">
                  <span>{t.subject?.name || 'General Subject'}</span>
                </div>

                {t.deadline && (
                  <p className="text-xs text-slate-400 flex items-center space-x-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Due: {new Date(t.deadline).toLocaleDateString()} {new Date(t.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-indigo-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                  <span>+{t.xp_reward || 50} XP</span>
                </div>

                <div className="flex items-center space-x-1">
                  {t.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleCompleteTask(t.id)}
                        title="Mark Completed"
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMarkMissed(t.id)}
                        title="Mark Missed"
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { setEditingTask(t); setIsModalOpen(true); }}
                    title="Edit Task"
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    title="Delete Task"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <CheckSquare className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium">No tasks found matching filter.</p>
        </div>
      )}

      {/* Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};
