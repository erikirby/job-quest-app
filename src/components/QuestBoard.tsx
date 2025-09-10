import React, { useState, useRef } from 'react';
import type { Job, Profile, JobRating } from '../types';
import { jobService } from '../services/jobService';
import Card from './ui/Card';
import Button from './ui/Button';
import { PORTALS, POKEMON_CARD_TYPES, ICONS, PRELOADED_IMAGES } from '../constants';

interface QuestBoardProps {
  profile: Profile;
  onAddJob: (jobData: Partial<Job>, action: 'save' | 'submit') => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const calculateRarity = (job: Partial<Job>, preferences: Profile['preferences']): number => {
    let score = 1;
    if (job.remote) score++;
    
    const jobText = `${job.title || ''} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
    
    const hasKeyword = preferences.keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
    if (hasKeyword) score++;

    const hasRole = preferences.preferredRoles.some(role => (job.title || '').toLowerCase().includes(role.toLowerCase()));
    if (hasRole) score++;

    const hasLocalization = jobText.includes('japanese') || jobText.includes('localization');
    if (hasLocalization) score++;

    return Math.min(5, score);
};

const QuestPreviewCard: React.FC<{ 
    job: Partial<Job>; 
    onSave: () => void; 
    onSubmit: () => void; 
    isLoading: boolean;
}> = ({ job, onSave, onSubmit, isLoading }) => {
    const cardType = job.type || 'colorless';
    const colors = POKEMON_CARD_TYPES[cardType] || POKEMON_CARD_TYPES.colorless;

    return (
        <div className="mt-8 animate-fade-in max-w-sm mx-auto">
             <div className={`p-1.5 rounded-xl shadow-lg ${colors.bg} ${colors.border} border-4`}>
                <div className={`p-2.5 rounded-lg ${colors.body} border-2 ${colors.border}`}>
                    {/* Header */}
                    <div className={`flex justify-between items-center px-3 py-1 rounded-t-md ${colors.bg} border-b-4 ${colors.border}`}>
                        <h3 className={`text-lg font-bold ${colors.text} truncate`}>{job.title || 'Untitled Quest'}</h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-sm font-bold ${colors.rarity}`}>HP</span>
                            <span className={`text-xl font-bold ${colors.rarity}`}>{ (job.rarity || 1) * 30 }</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${colors.bg} border-2 ${colors.border}`}>
                               {colors.icon}
                            </div>
                        </div>
                    </div>

                    {/* Image Frame */}
                    <div className={`relative my-2 p-1 bg-white/50 rounded-md border-4 ${colors.border} shadow-inner`}>
                       <img src={job.imageUrl} alt={`Artwork for ${job.title}`} className="w-full h-auto aspect-[4/3] object-cover bg-slate-200 rounded-sm" />
                    </div>
                    
                    {/* Body */}
                    <div className={`${colors.body} p-3 rounded-b-md`}>
                         <div className="space-y-3">
                            <div>
                                <p className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>{job.company || 'Unknown Company'}</p>
                                <p className="text-sm text-slate-600">{job.location || 'No Location'}</p>
                            </div>
                            
                            <hr className={`${colors.border}`} />

                            <div>
                                 <p className={`text-xs font-bold ${colors.text} mb-1.5`}>Primary Objective</p>
                                 <p className="text-xs text-slate-700 leading-snug">{job.description || 'No description available.'}</p>
                            </div>
                            
                            <hr className={`${colors.border}`} />
                            
                            <div>
                                 <p className={`text-xs font-bold ${colors.text} mb-1.5`}>Required Skills</p>
                                 <div className="flex flex-wrap gap-1.5">
                                    {(job.tags || []).map(tag => (
                                        <span key={tag} className="bg-white/80 border border-slate-300 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                         </div>
                     </div>
                 </div>
             </div>
             
             <div className="p-3 flex justify-center space-x-2">
                 <Button variant="ghost" onClick={onSave} disabled={isLoading} className="!px-8">Save</Button>
                 <Button variant="primary" onClick={onSubmit} disabled={isLoading} className="!px-8">Submit</Button>
             </div>
        </div>
    );
};


const QuestBoard: React.FC<QuestBoardProps> = ({ profile, onAddJob, isLoading, setIsLoading }) => {
    const [importText, setImportText] = useState('');
    const [ratingText, setRatingText] = useState('');
    const [ratingResult, setRatingResult] = useState<JobRating | null>(null);
    const [previewJob, setPreviewJob] = useState<Partial<Job> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Parsing...');
    
    const handleCreateCard = async () => {
        setError(null);
        setPreviewJob(null);
        setIsLoading(true);
        setLoadingMessage("Parsing Job Details...");
        
        try {
            if (importText.trim().length < 50) {
                throw new Error("Pasted text is too short. Please paste the full job description.");
            }
            
            const cardData = await jobService.parseJobFromText(importText);
            
            // Assign a random preloaded image
            cardData.imageUrl = PRELOADED_IMAGES[Math.floor(Math.random() * PRELOADED_IMAGES.length)];

            cardData.rarity = calculateRarity(cardData, profile.preferences);
            const types = Object.keys(POKEMON_CARD_TYPES);
            cardData.type = types[Math.floor(Math.random() * types.length)];
            
            setPreviewJob(cardData);
            setImportText('');

        } catch (err: any) {
            setError(err.message || 'Failed to create Quest Card. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRatingCheck = async () => {
        setError(null);
        setRatingResult(null);
        setIsLoading(true);
        setLoadingMessage("Analyzing fit...");
        try {
            if (ratingText.trim().length < 50) {
                throw new Error("Pasted text is too short. Please paste the full job description for an accurate rating.");
            }
            const result = await jobService.rateJobFit(ratingText, profile);
            setRatingResult(result);
        } catch (err: any) {
             setError(err.message || 'Failed to analyze job rating. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = (action: 'save' | 'submit') => {
        if (!previewJob) return;
        onAddJob(previewJob, action);
        setPreviewJob(null);
    };

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Portals</h2>
                <p className="text-center text-slate-600 mb-6">Begin your quest by visiting these popular realms.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {PORTALS.map(portal => (
                        <a href={portal.url} target="_blank" rel="noopener noreferrer" key={portal.id} 
                           className="bg-white/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4
                                      flex flex-col items-center justify-center text-center
                                      hover:shadow-xl hover:-translate-y-1 hover:bg-white/70 transition-all duration-300 group">
                            <div className="text-3xl mb-2 text-slate-700 group-hover:text-blue-500 transition-colors">
                                {portal.icon}
                            </div>
                            <span className="text-slate-800 font-bold">{portal.name}</span>
                            <span className="text-xs text-slate-500 hidden sm:block">{portal.subtitle}</span>
                        </a>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Create Quest Card & Star Rating Check</h2>
                <p className="text-center text-slate-600 mb-6">Analyze a job's fit, or turn it into a collectible card.</p>
                
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Create Quest Card Section */}
                    <div className="bg-white/30 p-6 rounded-xl shadow-inner border border-white/30">
                        <h3 className="font-semibold text-lg text-slate-700 mb-2">Create Quest Card</h3>
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Paste the full job description here..."
                            className="w-full h-24 p-3 border border-white/30 bg-white/50 rounded-lg focus:ring-blue-400 focus:border-blue-400 transition"
                            disabled={isLoading}
                        />
                        <div className="mt-4 flex flex-col items-center justify-center">
                            <Button onClick={handleCreateCard} disabled={isLoading || importText.trim().length === 0} className="w-full sm:w-auto">
                                {isLoading ? loadingMessage : 'Create Card from Text'}
                            </Button>
                        </div>
                    </div>

                    {/* Star Rating Section */}
                    <div className="bg-white/30 p-6 rounded-xl shadow-inner border border-white/30">
                        <h3 className="font-semibold text-lg text-slate-700 mb-2">Star Rating Check</h3>
                         <textarea
                            value={ratingText}
                            onChange={(e) => setRatingText(e.target.value)}
                            placeholder="Paste job description to check its fit..."
                            className="w-full h-24 p-3 border border-white/30 bg-white/50 rounded-lg focus:ring-purple-400 focus:border-purple-400 transition"
                            disabled={isLoading}
                        />
                        <div className="mt-4 text-center">
                            <Button variant="secondary" onClick={handleRatingCheck} disabled={isLoading || ratingText.trim().length === 0}>
                                {isLoading ? loadingMessage : 'Check Fit'}
                            </Button>
                        </div>
                    </div>
                </div>

                {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                
                {isLoading && !previewJob && !ratingResult &&
                  <div className="text-center p-8">
                      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="font-semibold text-slate-600">{loadingMessage}</p>
                  </div>
                }

                {ratingResult && (
                    <div className="mt-6 p-4 bg-white/50 rounded-lg animate-fade-in border border-white/30">
                        <h3 className="font-bold text-center text-slate-800 text-lg mb-2">Job Fit Analysis</h3>
                        <div className="flex justify-center items-center mb-2">
                             {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`text-3xl ${i < ratingResult.rating ? 'text-yellow-400' : 'text-slate-300'}`}>{ICONS.STAR}</span>
                            ))}
                        </div>
                        <p className="text-center text-slate-700">{ratingResult.reasoning}</p>
                    </div>
                )}
                
                {previewJob && <QuestPreviewCard 
                    job={previewJob} 
                    onSave={() => handleAdd('save')} 
                    onSubmit={() => handleAdd('submit')}
                    isLoading={isLoading} 
                />}
            </Card>
        </div>
    );
};

export default QuestBoard;