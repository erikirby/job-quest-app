import React, { useState, useRef } from 'react';
import type { Job, Profile } from '../types';
import { jobService } from '../services/jobService';
import Card from './ui/Card';
import Button from './ui/Button';
import { ICONS, PORTALS, CARD_TYPE_COLORS } from '../constants';

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

const getCardType = (job: Partial<Job>): string => {
    const jobText = `${job.title || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
    if (jobText.includes('localization') || jobText.includes('japanese')) return 'localization';
    if (jobText.includes('design') || jobText.includes('creative') || jobText.includes('artist')) return 'creative';
    if (jobText.includes('engineer') || jobText.includes('developer') || jobText.includes('tech') || jobText.includes('data')) return 'tech';
    return 'default';
};

const QuestPreviewCard: React.FC<{ job: Partial<Job>; onSave: () => void; onSubmit: () => void; isLoading: boolean;}> = ({ job, onSave, onSubmit, isLoading }) => {
    const cardType = getCardType(job);
    const colors = CARD_TYPE_COLORS[cardType] || CARD_TYPE_COLORS.default;

    return (
        <div className="mt-8 animate-fade-in max-w-sm mx-auto">
             <div className={`p-4 rounded-xl shadow-lg ${colors.bg} ${colors.border} border-2`}>
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${colors.text}`}>{job.title || 'Untitled Quest'}</h3>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${colors.rarity}`}>HP</span>
                        <span className={`text-xl font-bold ${colors.rarity}`}>{ (job.rarity || 1) * 30 }</span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${colors.bg} border-2 ${colors.border}`}>
                           {colors.typeIcon}
                        </div>
                    </div>
                </div>

                {/* Image Frame */}
                <div className={`my-3 p-1 bg-white/50 rounded-md border-4 ${colors.border} shadow-inner`}>
                    {job.imageUrl ? (
                        <img src={job.imageUrl} alt={`Artwork for ${job.title}`} className="w-full h-auto aspect-[4/3] object-cover bg-slate-200 rounded-sm" />
                    ) : (
                        <div className="w-full h-auto aspect-[4/3] bg-slate-100 flex items-center justify-center rounded-sm">
                            <p className="text-slate-400">No Image</p>
                        </div>
                    )}
                </div>
                
                {/* Body */}
                <div className={`${colors.body} p-3 rounded-md border ${colors.border}`}>
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
             
             <div className="p-3 flex justify-center space-x-2">
                 <Button variant="ghost" onClick={onSave} disabled={isLoading} className="!px-8">Save</Button>
                 <Button variant="primary" onClick={onSubmit} disabled={isLoading} className="!px-8">Submit</Button>
             </div>
        </div>
    );
};


const QuestBoard: React.FC<QuestBoardProps> = ({ profile, onAddJob, isLoading, setIsLoading }) => {
    const [importText, setImportText] = useState('');
    const [previewJob, setPreviewJob] = useState<Partial<Job> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Importing...');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleParse = async (method: 'text' | 'image', data: string | { base64: string; mime: string }) => {
        setError(null);
        setPreviewJob(null);
        setIsLoading(true);
        
        try {
            setLoadingMessage("Parsing details...");
            let parsedData;
            if (method === 'text' && typeof data === 'string') {
                if (data.trim().length < 50) {
                    throw new Error("Pasted text is too short. Please paste the full job description.");
                }
                parsedData = await jobService.parseJobFromText(data);
                parsedData.source = 'Manual Text';
            } else if (method === 'image' && typeof data === 'object') {
                parsedData = await jobService.parseJobFromImage(data.base64, data.mime);
                parsedData.source = 'Manual Image';
            } else {
                 throw new Error("Invalid import method or data.");
            }
            
            setLoadingMessage("Generating artwork...");
            const imageUrl = await jobService.generateJobImage(parsedData);
            parsedData.imageUrl = imageUrl;
            
            parsedData.rarity = calculateRarity(parsedData, profile.preferences);
            setPreviewJob(parsedData);
            setImportText('');

        } catch (err: any) {
            setError(err.message || 'Failed to parse job details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            if (base64) {
                handleParse('image', { base64, mime: file.type });
            }
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset file input
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
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Import a Quest</h2>
                <p className="text-center text-slate-600 mb-6">Found a job posting? Bring it back here to track it.</p>
                
                <div className="bg-white/30 p-6 rounded-xl shadow-inner border border-white/30">
                    <h3 className="font-semibold text-lg text-slate-700 mb-2">Paste Job Description</h3>
                    <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full h-32 p-3 border border-white/30 bg-white/50 rounded-lg focus:ring-blue-400 focus:border-blue-400 transition"
                        disabled={isLoading}
                    />
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={() => handleParse('text', importText)}
                            disabled={isLoading || importText.trim().length === 0}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? loadingMessage : 'Import from Text'}
                        </Button>
                         <span className="text-slate-500 font-semibold">OR</span>
                         <Button
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                             {isLoading ? loadingMessage : 'Upload Screenshot'}
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                    </div>
                </div>

                {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                
                {isLoading && !previewJob &&
                  <div className="text-center p-8">
                      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="font-semibold text-slate-600">{loadingMessage}</p>
                  </div>
                }
                
                {previewJob && <QuestPreviewCard job={previewJob} onSave={() => handleAdd('save')} onSubmit={() => handleAdd('submit')} isLoading={isLoading} />}
            </Card>
        </div>
    );
};

export default QuestBoard;