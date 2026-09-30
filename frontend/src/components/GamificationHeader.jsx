import React from 'react';
import { Flame, Zap, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GamificationHeader = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      {/* Daily Streak Badge */}
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs sm:text-sm">
        <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
        <span>{user.streak || 1} Day Streak</span>
      </div>

      {/* XP Level Badge */}
      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold text-xs sm:text-sm">
        <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
        <span>{user.xp || 0} XP</span>
      </div>
    </div>
  );
};
