import React from 'react';
import type { GameState } from '../types';
import { BADGES } from '../constants';
import Card from './ui/Card';

interface BadgeGalleryProps {
  gameState: GameState;
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ gameState }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">Badge Gallery</h1>
        <p className="mt-2 text-slate-600">Collect achievements on your job-hunting journey!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {BADGES.map(badge => {
          const isUnlocked = gameState.unlockedBadges.includes(badge.id);
          return (
            <Card
              key={badge.id}
              className={`flex flex-col items-center text-center transition-all duration-300 !p-4 ${
                !isUnlocked ? 'opacity-60' : ''
              }`}
            >
              <div className={`relative w-24 h-24 rounded-full bg-white/50 flex items-center justify-center mb-4 transition-all duration-300 ${!isUnlocked ? 'grayscale' : ''}`}>
                <div className="text-6xl">{badge.icon}</div>
                 {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{badge.name}</h3>
              <p className="text-sm text-slate-500 mt-1 h-10">{badge.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGallery;
