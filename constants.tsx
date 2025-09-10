import React from 'react';
import type { Badge, Mission, Profile, GameState, Job } from './types';
// FIX: The 'subDays' function was not found in the top-level 'date-fns' import. Importing it directly from its submodule 'date-fns/subDays' resolves the module resolution error.
import { isSameDay, getDay } from 'date-fns';
import subDays from 'date-fns/subDays';

// --- ICONS ---
// Using Heroicons (https://heroicons.com/) as JSX for simplicity
export const ICONS = {
  DASHBOARD: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  QUEST: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  QUEST_LOG: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  MISSIONS: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  BADGES: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  SETTINGS: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  STAR: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  FIRE: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l-.546 1.07a1 1 0 001.054 1.464c.598-.344 1.255-.742 1.89-1.22l.53-.402a1 1 0 00-.386-1.45zm-2.148 2.14a1 1 0 01-.28.95l-1.638 1.636a1 1 0 001.414 1.414l1.638-1.636a1 1 0 00-.95-.28zM8 5.75a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 5.75zM10.857 11.143a1 1 0 00-1.414 1.414l1.638 1.636a1 1 0 001.414-1.414l-1.638-1.636zM13.25 10a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75zM6.75 10a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>,
  CHECK: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
  LINKEDIN: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>,
  INDEED: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.812 18.001c-.034.006-.067.011-.1.017-1.312.316-2.868-.868-2.923-2.222-.055-1.354 1.102-2.845 2.414-3.161.034-.006.067-.011.1-.017 1.312-.316 2.868.868 2.923 2.222.055 1.354-1.102 2.845-2.414 3.161zm10.812-3.882c-.34 1.637-2.072 2.853-3.711 2.513s-2.853-2.072-2.513-3.711 2.072-2.853 3.711-2.513 2.853 2.072 2.513 3.711z"/></svg>,
  WELLFOUND: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 3c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 3c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z"/></svg>,
  TYPE_TECH: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" /></svg>,
  TYPE_LOC: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-2.25a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5Z" /><path d="M12 18.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v12a.75.75 0 0 1-.75.75Z" /><path d="M17.25 12.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-.75.75Z" /><path d="M19.5 15a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75Z" /><path d="M4.5 15a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75Z" /><path d="M6.75 12.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-.75.75Z" /></svg>,
  TYPE_CREATIVE: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.25 3v18h1.5V3h-1.5Z" /><path d="M3 12.75v-1.5h18v1.5H3Z" /><path d="m5.22 5.22-.53-.53a.75.75 0 0 1 1.06-1.06l.53.53a.75.75 0 0 1-1.06 1.06Z" /><path d="M18.78 18.78l.53.53a.75.75 0 1 0 1.06-1.06l-.53-.53a.75.75 0 0 0-1.06 1.06Z" /><path d="m18.78 5.22-1.06-1.06a.75.75 0 0 0-1.06 1.06l1.06 1.06a.75.75 0 1 0 1.06-1.06Z" /><path d="m3.67 19.83.53-.53a.75.75 0 1 0-1.06-1.06l-.53.53a.75.75 0 0 0 1.06 1.06Z" /></svg>,
};

// --- QUEST CARD "TYPES" ---
export const CARD_TYPE_COLORS: Record<string, { bg: string, border: string, text: string, body: string, rarity: string, typeIcon: JSX.Element }> = {
    tech: { bg: 'bg-yellow-300', border: 'border-yellow-500', text: 'text-yellow-900', body: 'bg-yellow-100/70', rarity: 'text-yellow-800', typeIcon: ICONS.TYPE_TECH },
    localization: { bg: 'bg-purple-300', border: 'border-purple-500', text: 'text-purple-900', body: 'bg-purple-100/70', rarity: 'text-purple-800', typeIcon: ICONS.TYPE_LOC },
    creative: { bg: 'bg-orange-300', border: 'border-orange-500', text: 'text-orange-900', body: 'bg-orange-100/70', rarity: 'text-orange-800', typeIcon: ICONS.TYPE_CREATIVE },
    default: { bg: 'bg-slate-300', border: 'border-slate-500', text: 'text-slate-900', body: 'bg-slate-100/70', rarity: 'text-slate-800', typeIcon: <div className="w-5 h-5"></div> },
};

// --- JOB PORTALS ---
export const PORTALS = [
    { id: 'linkedin', name: 'LinkedIn', subtitle: 'Professional network', url: 'https://linkedin.com/jobs', icon: ICONS.LINKEDIN },
    { id: 'indeed', name: 'Indeed', subtitle: 'Millions of jobs', url: 'https://indeed.com', icon: ICONS.INDEED },
    { id: 'wellfound', name: 'Wellfound', subtitle: 'Startup roles', url: 'https://wellfound.com', icon: ICONS.WELLFOUND },
    { id: 'remoteok', name: 'RemoteOK', subtitle: 'Remote-first', url: 'https://remoteok.com', icon: <span className="text-2xl">🏝️</span> },
    { id: 'weworkremotely', name: 'We Work Remotely', subtitle: 'Remote community', url: 'https://weworkremotely.com', icon: <span className="text-2xl">🌍</span> },
    { id: 'glassdoor', name: 'Glassdoor', subtitle: 'Company reviews', url: 'https://glassdoor.com/jobs', icon: <span className="text-2xl">🏢</span> },
    { id: 'tokyodev', name: 'TokyoDev', subtitle: 'Dev jobs in Japan', url: 'https://www.tokyodev.com/jobs', icon: <span className="text-2xl">🗼</span> },
    { id: 'japandev', name: 'Japan Dev', subtitle: 'Tech jobs in Japan', url: 'https://japan-dev.com/jobs', icon: <span className="text-2xl">🗾</span> },
    { id: 'locjobs', name: 'LocJobs', subtitle: 'Localization roles', url: 'https://locjobs.com', icon: <span className="text-2xl">🌐</span> },
];

// --- GAME RULES ---
export const XP_VALUES = {
  SUBMIT: 3,
  DAILY_CHECKIN: 5,
  REJECTED: 1,
  MISSION: 2,
};
export const SUBMISSIONS_PER_LEVEL = 10;

// --- INITIAL DATA ---
export const INITIAL_PROFILES: Profile[] = [
  { id: 'erik', name: 'Erik', preferences: { remoteOnly: true, keywords: ['ai', 'tech', 'japanese', 'localization'], preferredRoles: ['Community Manager', 'Localization', 'Content Specialist'] } },
  { id: 'zack', name: 'Zack', preferences: { remoteOnly: true, keywords: ['typescript', 'react', 'node'], preferredRoles: ['Frontend Developer', 'Full Stack Engineer'] } },
];
export const INITIAL_GAME_STATE: GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  lastCheckIn: null,
  dailyMissions: {},
  lastMissionReset: null,
  unlockedBadges: [],
  applications: {},
  savedJobs: [],
};
export const DAILY_MISSIONS: Mission[] = [
  { id: 'check_linkedin', name: 'Check LinkedIn for new roles', xp: XP_VALUES.MISSION },
  { id: 'check_indeed', name: 'Check Indeed for new roles', xp: XP_VALUES.MISSION },
  { id: 'update_resume', name: 'Update Resume/Profile', xp: XP_VALUES.MISSION },
  { id: 'connect_professional', name: 'Connect with 1 Professional', xp: XP_VALUES.MISSION },
  { id: 'send_followup', name: 'Send 1 Follow-up', xp: XP_VALUES.MISSION },
];

// --- BADGES ---
export const BADGES: Badge[] = [
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Submit 5 applications in one day.',
    icon: <span role="img" aria-label="runner">🏃</span>,
    criteria: (state) => Object.values(state.applications).filter(app => isSameDay(new Date(app.submittedAt), new Date())).length >= 5,
  },
  {
    id: 'unbroken',
    name: 'Unbroken',
    description: 'Achieve a 7-day check-in streak.',
    icon: <span role="img" aria-label="chain">⛓️</span>,
    criteria: (state) => state.streak >= 7,
  },
  {
    id: 'ronin',
    name: 'Ronin',
    description: 'Submit 3+ Japanese/Localization jobs in one day.',
    icon: <span role="img" aria-label="torii gate">⛩️</span>,
    criteria: (state, jobs) => {
        const todaySubmissions = Object.values(state.applications)
            .filter(app => isSameDay(new Date(app.submittedAt), new Date()));
        const relevantJobs = todaySubmissions.map(app => jobs[app.jobId]).filter(Boolean);
        const count = relevantJobs.filter(job => 
            `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase().includes('japanese') ||
            `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase().includes('localization')
        ).length;
        return count >= 3;
    }
  },
  {
    id: 'followup_ninja',
    name: 'Follow-Up Ninja',
    description: 'Complete 3 follow-ups in a week.',
    icon: <span role="img" aria-label="ninja">🥷</span>,
    criteria: (state) => {
        const today = new Date();
        const oneWeekAgo = subDays(today, 7);
        const recentFollowUps = Object.values(state.applications)
            .flatMap(app => app.followUps)
            .filter(fu => fu.completed && new Date(fu.dueDate) >= oneWeekAgo && new Date(fu.dueDate) <= today);
        return recentFollowUps.length >= 3;
    }
  },
];