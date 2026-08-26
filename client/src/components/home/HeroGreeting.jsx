import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const HeroGreeting = () => {
  const { user, isAuthenticated } = useAuth();

  const firstName = isAuthenticated && user?.name
    ? user.name.split(' ')[0]
    : null;

  return (
    <div className="px-4 pt-5 pb-2 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
        <span className="text-sm font-semibold" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
          {firstName ? `Welcome back, ${firstName}` : 'Discover'}
        </span>
      </div>
      <h1 className="text-3xl font-black leading-tight" style={{ color: '#f8fafc' }}>
        {firstName ? (
          <>Shop<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Premium Products
            </span>
          </>
        ) : (
          <>
            Premium<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Products
            </span>
          </>
        )}
      </h1>
    </div>
  );
};
