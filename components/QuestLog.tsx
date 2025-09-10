import React, { useState } from 'react';
import type { Job, GameState, Application } from '../types';
import { ApplicationStatus } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { format, isAfter, addDays } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import { POKEMON_CARD_TYPES } from '../constants';

interface QuestLogProps {
    userJobs: Record<string, Job>;
    gameState: GameState;
    onUpdateApplication: (jobId: string, updatedApp: Application) => void;
    onDeleteSavedJob: (jobId: string) => void;
    onApplyToJob: (jobId: string) => void;
}

const QuestCard: React.FC<{ job: Job; onClick: () => void; }> = ({ job, onClick }) => {
    const cardType = job.type || 'colorless';
    const colors = POKEMON_CARD_TYPES[cardType] || POKEMON_CARD_TYPES.colorless;
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="cursor-pointer group" onClick={onClick}>
            <div className={`p-1.5 rounded-xl shadow-lg ${colors.bg} ${colors.border} border-4 group-hover:scale-105 group-hover:shadow-2xl transition-transform duration-300`}>
                <div className={`p-2.5 rounded-lg ${colors.body} border-2 ${colors.border}`}>
                    {/* Header */}
                    <div className={`flex justify-between items-center px-3 py-1 rounded-t-md ${colors.bg} border-b-4 ${colors.border}`}>
                        <h3 className={`text-sm font-bold ${colors.text} truncate`}>{job.title}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`text-xs font-bold ${colors.rarity}`}>HP</span>
                            <span className={`text-base font-bold ${colors.rarity}`}>{job.rarity * 30}</span>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${colors.bg} border-2 ${colors.border}`}>
                               {colors.icon}
                            </div>
                        </div>
                    </div>

                    {/* Image Frame */}
                    <div className={`my-2 p-1 bg-white/50 rounded-md border-4 ${colors.border} shadow-inner`}>
                        <img src={job.imageUrl} alt={`Artwork for ${job.title}`} className="w-full h-auto aspect-[4/3] object-cover bg-slate-200 rounded-sm" />
                    </div>
                    
                    {/* Body */}
                    <div className={`${colors.body} p-2 rounded-b-md`}>
                        <p className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>{job.company}</p>
                        <hr className={`my-1 ${colors.border}`} />
                        <p className={`text-xs text-slate-700 leading-snug ${!showMore ? 'line-clamp-2' : ''}`}>{job.description}</p>
                         {job.description.length > 100 && (
                           <button onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }} className={`text-[10px] font-bold ${colors.text} hover:underline`}>
                             {showMore ? 'Show Less' : 'Show More'}
                           </button>
                         )}
                    </div>
                 </div>
             </div>
        </div>
    );
};

const SavedQuests: React.FC<Omit<QuestLogProps, 'onUpdateApplication'>> = ({ userJobs, gameState, onDeleteSavedJob, onApplyToJob }) => {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const savedJobs = gameState.savedJobs.map(id => userJobs[id]).filter(Boolean);

    if (savedJobs.length === 0) {
        return <p className="text-center text-slate-500 py-8">No quests saved yet. Go to the Quest Board to import some!</p>;
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {savedJobs.map(job => (
                    <QuestCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
                ))}
            </div>

            {selectedJob && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setSelectedJob(null)}>
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/30 space-y-4 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 text-center">{selectedJob.title}</h3>
                        <div className="flex flex-col space-y-3">
                           <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="w-full">
                             <Button variant="ghost" className="w-full">See Posting</Button>
                           </a>
                           <Button variant="secondary" className="w-full" onClick={() => { onDeleteSavedJob(selectedJob.id); setSelectedJob(null); }}>Delete</Button>
                           <Button variant="primary" className="w-full" onClick={() => { onApplyToJob(selectedJob.id); setSelectedJob(null); }}>Apply & Submit</Button>
                           <Button variant="ghost" className="w-full !bg-white/60" onClick={() => setSelectedJob(null)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
        <div className="space-y-3">
            {applications.map(app => {
                const job = userJobs[app.jobId];
                if (!job) return null;
                const cardType = job.type || 'colorless';
                const colors = POKEMON_CARD_TYPES[cardType] || POKEMON_CARD_TYPES.colorless;

                const nextFollowUp = app.followUps
                    .filter(fu => !fu.completed && (!fu.snoozedUntil || !isAfter(parseISO(fu.snoozedUntil), new Date())))
                    .sort((a, b) => (parseISO(a.dueDate) as any) - (parseISO(b.dueDate) as any))[0];

                return (
                    <Card key={app.jobId} className="!p-0 overflow-hidden">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="flex items-center gap-4 md:col-span-2">
                               <img src={job.imageUrl} className="w-16 h-12 object-cover rounded-md flex-shrink-0" alt="Job Artwork"/>
                               <div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${colors.bg} border-2 ${colors.border} flex-shrink-0`}>
                                            {React.cloneElement(colors.icon, {className: 'w-4 h-4 p-0'})}
                                        </div>
                                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-800 hover:text-blue-600 truncate">{app.jobTitle}</a>
                                    </div>
                                    <p className="text-sm text-slate-600">{app.company}</p>
                                    <p className="text-xs text-slate-500">Submitted: {format(parseISO(app.submittedAt), 'MMM dd, yyyy')}</p>
                               </div>
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-xs font-semibold text-slate-500">Status</label>
                                <select 
                                    value={app.status} 
                                    onChange={(e) => onUpdateApplication(app.jobId, {...app, status: e.target.value as ApplicationStatus})}
                                    className="w-full mt-1 p-2 text-sm border-slate-300/50 bg-white/50 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
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
