import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const HeroGreeting = () => {
  const { user, isAuthenticated } = useAuth();

  const firstName = isAuthenticated && user?.name
    ? user.name.split(' ')[0]
    : null;

  return (
    <div className="px-3 sm:px-4 pt-3 pb-2 animate-fade-in-up">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {firstName ? `Welcome back, ${firstName}` : 'Curated Marketplace'}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
        {firstName ? (
          <>
            Explore Your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Daily Deals</span>
          </>
        ) : (
          <>
            Shop <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Verified Brands</span> & Deals
          </>
        )}
      </h1>
    </div>
  );
};
