import React from 'react';
import type { GameState } from '../types';
import { DAILY_MISSIONS } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';
import { ICONS } from '../constants';

interface DailyMissionsProps {
  gameState: GameState;
  onCompleteMission: (missionId: string) => void;
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ gameState, onCompleteMission }) => {
  const completedMissions = DAILY_MISSIONS.filter(m => gameState.dailyMissions[m.id]).length;
  const allMissionsCompleted = completedMissions === DAILY_MISSIONS.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">Daily Missions</h1>
        <p className="mt-2 text-slate-600">Complete these tasks for bonus XP!</p>
      </div>
      
      {allMissionsCompleted && (
        <Card className="text-center !p-4 bg-green-400/50">
          <p className="font-bold text-green-800">All missions completed for today! Well done!</p>
        </Card>
      )}

      <div className="space-y-4">
        {DAILY_MISSIONS.map(mission => {
          const isCompleted = gameState.dailyMissions[mission.id];
          return (
            <Card
              key={mission.id}
              className={`!p-0 transition-all ${
                isCompleted ? 'bg-green-200/50' : ''
              }`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-2xl ${
                    isCompleted ? 'bg-green-400 text-white' : 'bg-purple-400 text-white'
                  }`}>
                    {isCompleted ? ICONS.CHECK : '📜'}
                  </div>
                  <div>
                    <p className={`font-semibold text-lg ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{mission.name}</p>
                    <p className="text-sm text-slate-500">+{mission.xp} XP</p>
                  </div>
                </div>
                <Button
                  onClick={() => onCompleteMission(mission.id)}
                  disabled={isCompleted}
                  className="!px-4 !py-2"
                  variant={isCompleted ? 'ghost' : 'secondary'}
                >
                  {isCompleted ? 'Done!' : 'Complete'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMissions;