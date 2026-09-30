import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { LayoutDashboard, CheckSquare, Calendar, Briefcase, MessageSquare } from 'lucide-react';

export const Layout = () => {
  const mobileNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Planner', path: '/planner', icon: Calendar },
    { label: 'Placement', path: '/placement', icon: Briefcase },
    { label: 'AI Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around z-40 px-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg text-xs font-medium ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
