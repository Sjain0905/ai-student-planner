import React from 'react';
import { LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GamificationHeader } from './GamificationHeader';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand subtitle badge on top mobile / header */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-indigo-950/50 border border-indigo-500/20 px-3 py-1 rounded-lg">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-200 hidden md:inline">
            Agentic AI Multi-Agent System
          </span>
        </div>
      </div>

      {/* Right side: XP, Streak, User profile & Logout */}
      <div className="flex items-center space-x-4">
        <GamificationHeader />

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <span className="text-sm font-medium text-slate-200 hidden sm:inline">
            {user?.full_name}
          </span>
          
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
