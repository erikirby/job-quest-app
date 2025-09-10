import React, { useState, useEffect, useCallback } from 'react';
import type { Tab, GameState, Job, Profile, Application, ApplicationStatus, ToastMessage } from './types';
import { Tab as TabEnum } from './types';
import { isToday, isYesterday, isSameDay, addDays, format } from 'date-fns';
import { INITIAL_PROFILES, INITIAL_GAME_STATE, XP_VALUES, SUBMISSIONS_PER_LEVEL, BADGES, ICONS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

import QuestBoard from './components/QuestBoard';
import Dashboard from './components/Dashboard';
import QuestLog from './components/QuestLog';
import DailyMissions from './components/DailyMissions';
import BadgeGallery from './components/BadgeGallery';
import Settings from './components/Settings';
import { ToastContainer } from './components/ui/Toast';
import { ConfettiEffect, SparkleEffect } from './components/ui/Effects';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(TabEnum.QuestBoard);
    const [profiles, setProfiles] = useLocalStorage<Profile[]>('jobquest_profiles', INITIAL_PROFILES);
    const [activeProfileId, setActiveProfileId] = useLocalStorage<string>('jobquest_activeProfileId', 'erik');
    
    // Per-profile state
    const [gameState, setGameState] = useLocalStorage<GameState>(`jobquest_gamestate_${activeProfileId}`, INITIAL_GAME_STATE);
    const [userJobs, setUserJobs] = useLocalStorage<Record<string, Job>>(`jobquest_jobs_${activeProfileId}`, {});

    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(format(new Date(), 'MMMM d, yyyy'));

    // Update date display once a day
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(format(new Date(), 'MMMM d, yyyy'));
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Resync state when profile changes
    useEffect(() => {
        const newGameState = JSON.parse(localStorage.getItem(`jobquest_gamestate_${activeProfileId}`) || JSON.stringify(INITIAL_GAME_STATE));
        const newUserJobs = JSON.parse(localStorage.getItem(`jobquest_jobs_${activeProfileId}`) || '{}');
        setGameState(newGameState);
        setUserJobs(newUserJobs);
    }, [activeProfileId, setGameState, setUserJobs]);

    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const checkAndAwardBadges = useCallback((currentState: GameState, allJobs: Record<string, Job>) => {
        const newlyUnlocked: string[] = [];
        BADGES.forEach(badge => {
            if (!currentState.unlockedBadges.includes(badge.id) && badge.criteria(currentState, allJobs)) {
                newlyUnlocked.push(badge.id);
            }
        });

        if (newlyUnlocked.length > 0) {
            setGameState(prev => ({
                ...prev,
                unlockedBadges: [...prev.unlockedBadges, ...newlyUnlocked],
            }));
            newlyUnlocked.forEach(id => {
                 const badge = BADGES.find(b => b.id === id);
                 if(badge) addToast(`Badge Unlocked: ${badge.name}!`, 'success');
            });
        }
    }, [setGameState, addToast]);
    
    // Daily reset logic for missions
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastReset = gameState.lastMissionReset;
        if (!lastReset || lastReset < today) {
            setGameState(prev => ({ ...prev, dailyMissions: {}, lastMissionReset: today }));
        }
    }, [gameState.lastMissionReset, setGameState]);

    const handleDailyCheckIn = () => {
        const lastCheckInDate = gameState.lastCheckIn ? new Date(gameState.lastCheckIn) : null;
        let newStreak = gameState.streak;

        if (lastCheckInDate && isYesterday(lastCheckInDate)) {
            newStreak += 1;
        } else if (!lastCheckInDate || !isSameDay(lastCheckInDate, new Date())) {
            newStreak = 1;
        } else {
            addToast("You've already checked in today!", 'warning');
            return;
        }

        const updatedState = {
            ...gameState,
            xp: gameState.xp + XP_VALUES.DAILY_CHECKIN,
            streak: newStreak,
            bestStreak: Math.max(gameState.bestStreak, newStreak),
            lastCheckIn: new Date().toISOString(),
        };
        setGameState(updatedState);
        addToast(`Checked in! +${XP_VALUES.DAILY_CHECKIN} XP. Streak: ${newStreak} days!`, 'success');
        checkAndAwardBadges(updatedState, userJobs);
    };
    
    const handleJobSubmit = (job: Job) => {
        if (gameState.applications[job.id]) {
            addToast("You've already submitted this quest!", 'warning');
            return;
        }

        const newApplication: Application = {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            status: 'Submitted' as ApplicationStatus,
            submittedAt: new Date().toISOString(),
            followUps: [
                { id: `${job.id}-fu1`, dueDate: addDays(new Date(), 3).toISOString(), completed: false },
                { id: `${job.id}-fu2`, dueDate: addDays(new Date(), 10).toISOString(), completed: false },
            ]
        };
        
        const newTotalSubmissions = Object.keys(gameState.applications).length + 1;
        const newLevel = Math.floor(newTotalSubmissions / SUBMISSIONS_PER_LEVEL) + 1;

        const updatedState: GameState = {
            ...gameState,
            xp: gameState.xp + XP_VALUES.SUBMIT,
            applications: { ...gameState.applications, [job.id]: newApplication },
            savedJobs: gameState.savedJobs.filter(id => id !== job.id), // Remove from saved if it was there
            level: newLevel,
        };
        setGameState(updatedState);

        const isFirstToday = !Object.values(gameState.applications).some(app => isToday(new Date(app.submittedAt)));
        if (isFirstToday) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }

        if (newLevel > gameState.level) {
            setShowSparkles(true);
            setTimeout(() => setShowSparkles(false), 3000);
            addToast(`LEVEL UP! You are now Level ${newLevel}!`, 'success');
        }

        addToast(`Quest submitted! +${XP_VALUES.SUBMIT} XP`, 'success');
        checkAndAwardBadges(updatedState, userJobs);
    };

    const handleAddJob = (jobData: Partial<Job>, action: 'save' | 'submit') => {
        const newJob: Job = {
            id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: jobData.title || 'Untitled Quest',
            company: jobData.company || 'Unknown Company',
            location: jobData.location || 'Unknown Location',
            url: jobData.url || '#',
            tags: jobData.tags || [],
            description: jobData.description || 'No description provided.',
            remote: jobData.remote || false,
            rarity: jobData.rarity || 1,
            emoji: jobData.emoji,
            type: jobData.type,
            source: jobData.source,
        };

        const newJobs = { ...userJobs, [newJob.id]: newJob };
        setUserJobs(newJobs);

        if (action === 'save') {
            setGameState(prev => ({
                ...prev,
                savedJobs: [...prev.savedJobs, newJob.id],
            }));
            addToast('Quest saved successfully!', 'success');
        } else if (action === 'submit') {
            handleJobSubmit(newJob);
        }
    };

    const handleCompleteMission = (missionId: string) => {
        if(gameState.dailyMissions[missionId]) return;
        const updatedState = {
            ...gameState,
            xp: gameState.xp + XP_VALUES.MISSION,
            dailyMissions: { ...gameState.dailyMissions, [missionId]: true }
        };
        setGameState(updatedState);
        addToast(`Mission Complete! +${XP_VALUES.MISSION} XP`, 'success');
        checkAndAwardBadges(updatedState, userJobs);
    };

    const handleUpdateApplication = (jobId: string, updatedApp: Application) => {
        const oldStatus = gameState.applications[jobId]?.status;
        let newXp = gameState.xp;
        if(oldStatus !== 'Rejected' && updatedApp.status === 'Rejected') {
            newXp += XP_VALUES.REJECTED;
            addToast(`Quest log updated. +${XP_VALUES.REJECTED} XP for persistence!`, 'info');
        }

        const updatedState = { ...gameState, xp: newXp, applications: { ...gameState.applications, [jobId]: updatedApp }};
        setGameState(updatedState);
        checkAndAwardBadges(updatedState, userJobs);
    };

    const handleDeleteSavedJob = (jobId: string) => {
        if (window.confirm("Are you sure you want to delete this saved quest?")) {
            setGameState(prev => ({ ...prev, savedJobs: prev.savedJobs.filter(id => id !== jobId) }));
            // Optional: remove from userJobs if not in applications
            if (!gameState.applications[jobId]) {
                const newJobs = { ...userJobs };
                delete newJobs[jobId];
                setUserJobs(newJobs);
            }
            addToast("Saved quest deleted.", "info");
        }
    };
    
    const handleResetData = () => {
        localStorage.removeItem(`jobquest_gamestate_${activeProfileId}`);
        localStorage.removeItem(`jobquest_jobs_${activeProfileId}`);
        setGameState(INITIAL_GAME_STATE);
        setUserJobs({});
        addToast("All data for this profile has been reset.", "warning");
    };

    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

    const tabContent = () => {
        switch(activeTab) {
            case TabEnum.Dashboard: return <Dashboard gameState={gameState} onDailyCheckIn={handleDailyCheckIn} onUpdateApplication={handleUpdateApplication} />;
            case TabEnum.QuestBoard: return <QuestBoard profile={activeProfile} onAddJob={handleAddJob} isLoading={isLoading} setIsLoading={setIsLoading} />;
            case TabEnum.QuestLog: return <QuestLog userJobs={userJobs} gameState={gameState} onUpdateApplication={handleUpdateApplication} onDeleteSavedJob={handleDeleteSavedJob} onApplyToJob={(jobId) => handleJobSubmit(userJobs[jobId])} />;
            case TabEnum.DailyMissions: return <DailyMissions gameState={gameState} onCompleteMission={handleCompleteMission} />;
            case TabEnum.BadgeGallery: return <BadgeGallery gameState={gameState} />;
            case TabEnum.Settings: return <Settings profiles={profiles} activeProfileId={activeProfileId} onProfileChange={setActiveProfileId} onResetData={handleResetData}/>;
            default: return null;
        }
    };
    
    const TAB_ICONS: Record<Tab, JSX.Element> = {
        [TabEnum.Dashboard]: ICONS.DASHBOARD,
        [TabEnum.QuestBoard]: ICONS.QUEST,
        [TabEnum.QuestLog]: ICONS.QUEST_LOG,
        [TabEnum.DailyMissions]: ICONS.MISSIONS,
        [TabEnum.BadgeGallery]: ICONS.BADGES,
        [TabEnum.Settings]: ICONS.SETTINGS,
    };
    
    const TAB_BACKGROUNDS: Record<Tab, string> = {
        [TabEnum.Dashboard]: 'from-sky-100 via-blue-200 to-indigo-200',
        [TabEnum.QuestBoard]: 'from-emerald-100 via-teal-200 to-cyan-200',
        [TabEnum.QuestLog]: 'from-purple-100 via-violet-200 to-fuchsia-200',
        [TabEnum.DailyMissions]: 'from-amber-100 via-yellow-200 to-orange-200',
        [TabEnum.BadgeGallery]: 'from-rose-100 via-pink-200 to-red-200',
        [TabEnum.Settings]: 'from-slate-100 via-gray-200 to-neutral-300',
    };

    return (
        <div className={`min-h-screen font-sans text-gray-800 flex flex-col pb-24 transition-colors duration-500 bg-gradient-to-br ${TAB_BACKGROUNDS[activeTab]}`}>
            {showConfetti && <ConfettiEffect />}
            {showSparkles && <SparkleEffect />}
            <ToastContainer messages={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            <header className="bg-white/30 backdrop-blur-md sticky top-0 z-10 border-b border-white/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-bold text-2xl text-slate-800">Job Quest</span>
                             <div className="ml-4 bg-white/50 rounded-full p-1 border border-white/30 hidden sm:block">
                                <div className="flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">{activeProfile.name.charAt(0)}</span>
                                    <span className="ml-2 mr-3 font-semibold text-slate-700">{activeProfile.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-semibold text-sm text-slate-700">{currentDate}</p>
                            </div>
                             <div className="text-right bg-white/50 p-2 rounded-lg border border-white/30">
                                <p className="font-bold text-slate-700">Lv. {gameState.level}</p>
                                <p className="text-xs text-slate-500 font-semibold">{gameState.xp} XP</p>
                             </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                {tabContent()}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-xl z-20 border-t border-white/30">
                <div className="grid grid-cols-6 max-w-2xl mx-auto">
                     {Object.values(TabEnum).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-all duration-200 transform focus:outline-none
                                ${activeTab === tab ? 'text-blue-500 scale-110' : 'text-slate-500 hover:text-blue-400'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${activeTab === tab ? 'bg-blue-100' : 'bg-transparent'}`}>
                                {React.cloneElement(TAB_ICONS[tab], {className: 'h-6 w-6'})}
                            </div>
                            <span className="mt-1 font-semibold">{tab}</span>
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default App;