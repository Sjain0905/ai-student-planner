import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Briefcase, 
  MessageSquare,
  Bot,
  BrainCircuit
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'AI Planner', path: '/planner', icon: Calendar },
    { label: 'Placement', path: '/placement', icon: Briefcase },
    { label: 'AI Chat Agent', path: '/chat', icon: MessageSquare, badge: 'LangGraph' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        {/* Logo & Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-none">
                AI Student Agent
              </h1>
              <p className="text-[10px] text-indigo-400 font-medium mt-0.5">
                Academic & Placement
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
          <Bot className="w-4 h-4" />
          <span>Multi-Agent Architecture</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Coordinator, Study & Task, and Placement Agents synchronized with PostgreSQL.
        </p>
      </div>
    </aside>
  );
};
