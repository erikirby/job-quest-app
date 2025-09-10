import React, { useState } from 'react';
import type { Job, GameState, Application } from '../types';
import { ApplicationStatus } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { format, isAfter, addDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';

interface QuestLogProps {
    userJobs: Record<string, Job>;
    gameState: GameState;
    onUpdateApplication: (jobId: string, updatedApp: Application) => void;
    onDeleteSavedJob: (jobId: string) => void;
    onApplyToJob: (jobId: string) => void;
}

const SavedQuests: React.FC<Omit<QuestLogProps, 'onUpdateApplication'>> = ({ userJobs, gameState, onDeleteSavedJob, onApplyToJob }) => {
    const savedJobs = gameState.savedJobs.map(id => userJobs[id]).filter(Boolean);

    if (savedJobs.length === 0) {
        return <p className="text-center text-slate-500 py-8">No quests saved yet. Go to the Quest Board to import some!</p>;
    }

    return (
        <div className="space-y-4">
            {savedJobs.map(job => (
                <Card key={job.id} className="!p-0 hover:shadow-xl">
                    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-slate-800 hover:text-blue-600">{job.title}</a>
                            <p className="text-slate-600">{job.company}</p>
                            <p className="text-sm text-slate-500">{job.location}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                            <Button variant="ghost" onClick={() => onDeleteSavedJob(job.id)}>Delete</Button>
                            <Button variant="primary" onClick={() => onApplyToJob(job.id)}>Apply</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const AppliedQuests: React.FC<Omit<QuestLogProps, 'onDeleteSavedJob' | 'onApplyToJob'>> = ({ userJobs, gameState, onUpdateApplication }) => {
    const applications = Object.values(gameState.applications).sort((a,b) => (parseISO(b.submittedAt) as any) - (parseISO(a.submittedAt) as any));

    if (applications.length === 0) {
        return <p className="text-center text-slate-500 py-8">No quests submitted yet. Let's get applying!</p>;
    }
    
    const handleFollowUpAction = (app: Application, followUpId: string, action: 'complete' | 'snooze') => {
        const updatedFollowUps = app.followUps.map(fu => {
            if (fu.id !== followUpId) return fu;
            if (action === 'complete') {
                return { ...fu, completed: true };
            }
            return { ...fu, snoozedUntil: addDays(new Date(), 3).toISOString() };
        });
        onUpdateApplication(app.jobId, { ...app, followUps: updatedFollowUps });
    };

    return (
        <div className="space-y-4">
            {applications.map(app => {
                const job = userJobs[app.jobId];
                const nextFollowUp = app.followUps
                    .filter(fu => !fu.completed && (!fu.snoozedUntil || !isAfter(parseISO(fu.snoozedUntil), new Date())))
                    .sort((a, b) => (parseISO(a.dueDate) as any) - (parseISO(b.dueDate) as any))[0];

                return (
                    <Card key={app.jobId} className="!p-0 overflow-hidden">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div className="md:col-span-2">
                                <a href={job?.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-slate-800 hover:text-blue-600">{app.jobTitle}</a>
                                <p className="text-slate-600">{app.company}</p>
                                <p className="text-sm text-slate-500">Submitted: {format(parseISO(app.submittedAt), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500">Status</label>
                                <select 
                                    value={app.status} 
                                    onChange={(e) => onUpdateApplication(app.jobId, {...app, status: e.target.value as ApplicationStatus})}
                                    className="w-full mt-1 p-2 border-slate-300/50 bg-white/50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                {nextFollowUp ? (
                                    <div className="bg-amber-400/30 p-2 rounded-lg text-center">
                                        <p className="text-sm font-semibold text-amber-800">Follow-up Due</p>
                                        <p className="text-xs text-amber-700">{format(parseISO(nextFollowUp.dueDate), 'MMM dd')}</p>
                                        <div className="flex gap-1 mt-1 justify-center">
                                            <button onClick={() => handleFollowUpAction(app, nextFollowUp.id, 'snooze')} className="text-xs hover:underline text-amber-600">Snooze</button>
                                            <span className="text-amber-400">|</span>
                                            <button onClick={() => handleFollowUpAction(app, nextFollowUp.id, 'complete')} className="text-xs hover:underline text-amber-600">Done</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-slate-500 p-2">No pending follow-ups.</div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

const QuestLog: React.FC<QuestLogProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'saved' | 'applied'>('applied');

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">Quest Log</h1>
                <p className="mt-2 text-slate-600">Track your saved and submitted applications.</p>
            </div>

            <div className="flex justify-center">
                <div className="bg-white/50 p-1 rounded-full border border-white/30 space-x-1">
                    <Button
                        onClick={() => setActiveTab('applied')}
                        variant={activeTab === 'applied' ? 'primary' : 'ghost'}
                        className="!shadow-none"
                    >
                        Applied ({Object.keys(props.gameState.applications).length})
                    </Button>
                    <Button
                        onClick={() => setActiveTab('saved')}
                        variant={activeTab === 'saved' ? 'primary' : 'ghost'}
                        className="!shadow-none"
                    >
                        Saved ({props.gameState.savedJobs.length})
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'applied' && <AppliedQuests {...props} />}
                {activeTab === 'saved' && <SavedQuests {...props} />}
            </div>
        </div>
    );
};

export default QuestLog;