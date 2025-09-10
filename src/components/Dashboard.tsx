
import React, { useMemo } from 'react';
import type { GameState, Application, FollowUp, Tab } from '../types';
import { Tab as TabEnum } from '../types';
import { XP_VALUES, SUBMISSIONS_PER_LEVEL, ICONS, BADGES } from '../constants';
import { isSameDay, isAfter, format, addDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import Card from './ui/Card';
import Button from './ui/Button';

interface DashboardProps {
  gameState: GameState;
  onDailyCheckIn: () => void;
  onUpdateApplication: (appId: string, updatedApp: Application) => void;
  setActiveTab: (tab: Tab) => void;
}

const CircularProgressBar: React.FC<{ progress: number; level: number; questsDone: number; questsNeeded: number; }> = ({ progress, level, questsDone, questsNeeded }) => {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                <circle cx="70" cy="70" r={radius} strokeWidth="12" className="stroke-gray-300/40" fill="transparent" />
                <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    strokeWidth="12"
                    stroke="url(#progressGradient)"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-sm font-semibold text-slate-500 -mt-1">
                    LV.
                </span>
                <span className="text-4xl font-bold text-slate-800 leading-none">
                    {level}
                </span>
            </div>
             <p className="text-sm text-slate-600 font-semibold mt-2">{questsDone} / {questsNeeded} Quests</p>
        </div>
    );
};

const DashboardActionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick?: () => void; color: string; }> = ({ icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className={`p-4 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-100 ${onClick ? 'cursor-pointer' : ''} ${color}`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="font-bold text-white text-lg">{title}</p>
                <p className="text-sm text-white/80">{subtitle}</p>
            </div>
            <div className="text-4xl text-white/50">{icon}</div>
        </div>
    </div>
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

const Dashboard: React.FC<DashboardProps> = ({ gameState, onDailyCheckIn, onUpdateApplication, setActiveTab }) => {
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
        <div className="flex justify-center">
            <CircularProgressBar 
                progress={xpPercentage}
                level={level}
                questsDone={submissionsForCurrentLevel}
                questsNeeded={SUBMISSIONS_PER_LEVEL}
            />
        </div>

      <div className="text-center">
        <Button onClick={onDailyCheckIn} disabled={hasCheckedInToday} className="!px-8 !py-3">
          {hasCheckedInToday ? "Checked In!" : `Daily Check-in (+${XP_VALUES.DAILY_CHECKIN} XP)`}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DashboardActionCard 
            icon="🔥" 
            title="Streak" 
            subtitle={`${streak} Days`} 
            color="bg-gradient-to-br from-orange-400 to-red-500" 
        />
        <DashboardActionCard 
            icon={ICONS.BADGES}
            title="Badges" 
            subtitle={`${unlockedBadges.length} / ${BADGES.length} Unlocked`}
            color="bg-gradient-to-br from-amber-400 to-yellow-500"
            onClick={() => setActiveTab(TabEnum.BadgeGallery)}
        />
        <DashboardActionCard 
            icon="📄" 
            title="Total Quests" 
            subtitle={`${totalSubmissions} Submitted`} 
            color="bg-gradient-to-br from-lime-400 to-green-500"
        />
        <DashboardActionCard 
            icon="🏅" 
            title="Best Streak" 
            subtitle={`${bestStreak} Days`} 
            color="bg-gradient-to-br from-cyan-400 to-sky-500"
        />
    </div>
      
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
    </div>
  );
};

export default Dashboard;
