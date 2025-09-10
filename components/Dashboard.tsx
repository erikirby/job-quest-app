import React, { useMemo } from 'react';
import type { GameState, Application, FollowUp } from '../types';
import { XP_VALUES, SUBMISSIONS_PER_LEVEL, ICONS } from '../constants';
import { isSameDay, isAfter, format, addDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import Card from './ui/Card';
import Button from './ui/Button';
import ProgressBar from './ui/ProgressBar';

interface DashboardProps {
  gameState: GameState;
  onDailyCheckIn: () => void;
  onUpdateApplication: (appId: string, updatedApp: Application) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex flex-col items-center justify-center text-center !p-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 text-white ${color}`}>{icon}</div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 font-semibold">{title}</p>
    </Card>
);

const FollowUpItem: React.FC<{ followUp: FollowUp; application: Application; onUpdateApplication: (appId: string, updatedApp: Application) => void; }> = ({ followUp, application, onUpdateApplication }) => {
    
    const handleAction = (action: 'complete' | 'snooze') => {
        const updatedFollowUps = application.followUps.map(fu => {
            if (fu.id !== followUp.id) return fu;
            if (action === 'complete') {
                return { ...fu, completed: true };
            }
            if (action === 'snooze') {
                return { ...fu, snoozedUntil: addDays(new Date(), 3).toISOString() };
            }
            return fu;
        });
        onUpdateApplication(application.jobId, { ...application, followUps: updatedFollowUps });
    };

    const isSnoozed = followUp.snoozedUntil && isAfter(parseISO(followUp.snoozedUntil), new Date());
    if (isSnoozed) return null;

    return (
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80">
            <div>
                <p className="font-semibold text-slate-800">Follow up with {application.company}</p>
                <p className="text-sm text-slate-600">{application.jobTitle}</p>
                <p className="text-xs text-red-500 font-bold">Due: {format(parseISO(followUp.dueDate), 'MMM dd, yyyy')}</p>
            </div>
            <div className="flex space-x-2">
                <Button variant="ghost" className="!px-3 !py-1 !text-xs" onClick={() => handleAction('snooze')}>Snooze</Button>
                <Button variant="primary" className="!px-3 !py-1 !text-xs" onClick={() => handleAction('complete')}>Done</Button>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ gameState, onDailyCheckIn, onUpdateApplication }) => {
  const { xp, level, streak, bestStreak, lastCheckIn, applications, unlockedBadges } = gameState;

  const hasCheckedInToday = lastCheckIn ? isSameDay(new Date(lastCheckIn), new Date()) : false;
  
  const totalSubmissions = Object.keys(applications).length;
  const submissionsForCurrentLevel = totalSubmissions % SUBMISSIONS_PER_LEVEL;
  const xpPercentage = (submissionsForCurrentLevel / SUBMISSIONS_PER_LEVEL) * 100;

  const pendingFollowUps = useMemo(() => {
      return Object.values(applications)
          .flatMap(app => app.followUps.map(fu => ({ ...fu, application: app })))
          .filter(fu => !fu.completed && isAfter(new Date(), parseISO(fu.dueDate)))
          .sort((a, b) => (parseISO(a.dueDate) > parseISO(b.dueDate) ? 1 : -1));
  }, [applications]);


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">Welcome back, Adventurer!</h1>
        <p className="mt-2 text-slate-600">Ready to conquer the job market?</p>
        <Button onClick={onDailyCheckIn} disabled={hasCheckedInToday} className="mt-4 !px-8 !py-3">
          {hasCheckedInToday ? "Checked In!" : `Daily Check-in (+${XP_VALUES.DAILY_CHECKIN} XP)`}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Current Level" value={level} icon={<span className="text-2xl">⚔️</span>} color="bg-blue-400" />
        <StatCard title="Total XP" value={xp} icon={<span className="text-2xl">✨</span>} color="bg-purple-400" />
        <StatCard title="Current Streak" value={streak} icon={<span className="text-2xl">🔥</span>} color="bg-orange-400" />
        <StatCard title="Best Streak" value={bestStreak} icon={<span className="text-2xl">🏆</span>} color="bg-yellow-400" />
      </div>

      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Level Progress</h2>
        <p className="text-sm text-slate-500 mb-4">{`You've submitted ${submissionsForCurrentLevel} of ${SUBMISSIONS_PER_LEVEL} quests for the next level.`}</p>
        <ProgressBar value={xpPercentage} />
      </Card>
      
      {pendingFollowUps.length > 0 && (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Follow-ups</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingFollowUps.map(fu => (
                    <FollowUpItem key={fu.id} followUp={fu} application={fu.application} onUpdateApplication={onUpdateApplication} />
                ))}
            </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
          <Card>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Application Status</h2>
              <div className="space-y-2">
                  {Object.entries(
                      Object.values(applications).reduce((acc, curr) => {
                          acc[curr.status] = (acc[curr.status] || 0) + 1;
                          return acc;
                      }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center text-slate-600">
                          <span>{status}</span>
                          <span className="font-bold bg-white/50 text-slate-800 text-xs px-2 py-1 rounded-full">{count}</span>
                      </div>
                  ))}
              </div>
          </Card>
          <Card>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Badges Unlocked</h2>
              <div className="flex flex-wrap gap-4">
                  {unlockedBadges.length > 0 ? unlockedBadges.map(badgeId => (
                      <div key={badgeId} className="text-5xl" title={badgeId}>{ICONS.BADGES}</div> // Replace with actual badge icons
                  )) : <p className="text-slate-500">No badges unlocked yet. Keep questing!</p>}
              </div>
          </Card>
      </div>
    </div>
  );
};

export default Dashboard;
