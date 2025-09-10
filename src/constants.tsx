
import React from 'react';
import type { Badge, Mission, Profile, GameState, Job } from './types';
import { isSameDay } from 'date-fns';
import subDays from 'date-fns/subDays';

// --- ICONS ---
// Using Heroicons (https://heroicons.com/) as JSX for simplicity
export const ICONS = {
  DASHBOARD: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  QUEST: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  QUEST_LOG: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  MISSIONS: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  BADGES: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  SETTINGS: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
  STAR: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  CHECK: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
  LINKEDIN: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>,
  INDEED: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.812 18.001c-.034.006-.067.011-.1.017-1.312.316-2.868-.868-2.923-2.222-.055-1.354 1.102-2.845 2.414-3.161.034-.006.067-.011.1-.017 1.312-.316 2.868.868 2.923 2.222.055 1.354-1.102 2.845-2.414 3.161zm10.812-3.882c-.34 1.637-2.072 2.853-3.711 2.513s-2.853-2.072-2.513-3.711 2.072-2.853 3.711-2.513 2.853 2.072 2.513 3.711z"/></svg>,
  WELLFOUND: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0 3c-3.866 0-7 3.134-7 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 3c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z"/></svg>,
};

// Fix: Add PORTALS constant for job board links.
export const PORTALS = [
  { id: 'linkedin', name: 'LinkedIn', subtitle: 'Professional Network', url: 'https://www.linkedin.com/jobs/', icon: ICONS.LINKEDIN },
  { id: 'indeed', name: 'Indeed', subtitle: 'Job Search Engine', url: 'https://www.indeed.com/', icon: ICONS.INDEED },
  { id: 'wellfound', name: 'Wellfound', subtitle: 'Startup Jobs', url: 'https://wellfound.com/', icon: ICONS.WELLFOUND },
];

// --- POKEMON TCG CARD "TYPES" ---
const POKEMON_TYPE_ICON_CLASS = "w-7 h-7 p-1";
export const POKEMON_CARD_TYPES: Record<string, { name: string; bg: string; border: string; text: string; body: string; rarity: string, icon: JSX.Element }> = {
    grass: { name: 'Grass', bg: 'bg-green-400', border: 'border-green-600', text: 'text-green-900', body: 'bg-green-200/70', rarity: 'text-green-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path d="M12.943 2.913a10.452 10.452 0 0 0-1.886 0c-1.868.52-3.413 1.636-4.486 3.095-.993 1.348-1.568 2.94-1.568 4.492 0 1.552.575 3.144 1.568 4.492 1.073 1.459 2.618 2.575 4.486 3.095 1.868.52 3.868.52 5.736 0 1.868-.52 3.413-1.636 4.486-3.095.993-1.348 1.568-2.94 1.568-4.492 0 1.552-.575-3.144-1.568-4.492-1.073-1.459-2.618-2.575-4.486-3.095a10.452 10.452 0 0 0-1.886 0Z" /></svg> },
    fire: { name: 'Fire', bg: 'bg-red-400', border: 'border-red-600', text: 'text-red-900', body: 'bg-red-200/70', rarity: 'text-red-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071 1.052A24.403 24.403 0 0 1 12 6.002a24.402 24.402 0 0 1-.892-2.664.75.75 0 0 0-1.071-1.052Z" clipRule="evenodd" /><path d="M12.264 9.373a.75.75 0 0 0-1.428-.431 22.89 22.89 0 0 0-1.64 5.341.75.75 0 0 0 .736.852 22.88 22.88 0 0 0 5.33-1.42.75.75 0 0 0-.41-1.452 21.38 21.38 0 0 1-4.018 1.058 21.38 21.38 0 0 1 1.43-4.948Z" /><path d="M13.155 7.42a.75.75 0 0 0-1.016-1.043A21.33 21.33 0 0 0 6.6 9.81a.75.75 0 0 0 .685.803A21.33 21.33 0 0 0 12 6.643c.663 0 1.323.018 1.977.054a.75.75 0 0 0 .75-.743 23.01 23.01 0 0 0-1.572 1.466Z" /><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-1.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" /></svg> },
    water: { name: 'Water', bg: 'bg-blue-400', border: 'border-blue-600', text: 'text-blue-900', body: 'bg-blue-200/70', rarity: 'text-blue-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Z" /><path d="M5.055 14.34A9.913 9.913 0 0 1 4.5 12c0-2.454.866-4.722 2.32-6.512a.75.75 0 0 1 1.13.978 8.413 8.413 0 0 0-1.45 5.534c0 1.254.29 2.453.81 3.538a.75.75 0 1 1-1.265.802ZM16.03 6.466a.75.75 0 0 1 1.13-.978A9.94 9.94 0 0 1 19.5 12c0 1.32-.257 2.592-.738 3.74a.75.75 0 1 1-1.265-.802 8.413 8.413 0 0 0 .81-3.538c0-2.09-.64-4.045-1.747-5.534Z" /></svg> },
    lightning: { name: 'Lightning', bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-900', body: 'bg-yellow-200/70', rarity: 'text-yellow-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" /></svg> },
    psychic: { name: 'Psychic', bg: 'bg-purple-400', border: 'border-purple-600', text: 'text-purple-900', body: 'bg-purple-200/70', rarity: 'text-purple-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path fillRule="evenodd" d="M7.89 2.25-.11 7.22a.75.75 0 0 0 .633 1.22H4.5v1.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75v-1.5h3v1.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75v-1.5h3.978a.75.75 0 0 0 .633-1.22l-8-4.97a.75.75 0 0 0-1.026 0Z" clipRule="evenodd" /><path d="M6 12a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12Z" /><path d="M6 15a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 15Z" /><path d="M6 18a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 18Z" /></svg> },
    fighting: { name: 'Fighting', bg: 'bg-orange-400', border: 'border-orange-600', text: 'text-orange-900', body: 'bg-orange-200/70', rarity: 'text-orange-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /><path fillRule="evenodd" d="M1.385 8.354a.75.75 0 0 1 .383-.92l5.74-2.46a.75.75 0 0 1 .92.384l2.46 5.74a.75.75 0 0 1-.383.92l-5.74 2.46a.75.75 0 0 1-.92-.383l-2.46-5.74Zm7.022.65-.89-2.076-2.077-.89 2.077-.89.89-2.076.89 2.076 2.076.89-2.076.89-.89 2.076Z" clipRule="evenodd" /><path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg> },
    darkness: { name: 'Darkness', bg: 'bg-gray-600', border: 'border-gray-800', text: 'text-gray-100', body: 'bg-gray-800/70', rarity: 'text-gray-200', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 1.5a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Z" clipRule="evenodd" /><path d="M12 1.5a.75.75 0 0 1 .75.75v1.162a8.313 8.313 0 0 1 5.485 5.485h1.162a.75.75 0 0 1 0 1.5h-1.162a8.313 8.313 0 0 1-5.485 5.485v1.162a.75.75 0 0 1-1.5 0v-1.162a8.313 8.313 0 0 1-5.485-5.485H4.5a.75.75 0 0 1 0-1.5h1.162A8.313 8.313 0 0 1 11.147 4.5H12a.75.75 0 0 1 0-1.5v-1.162A.75.75 0 0 1 12 1.5Z" /></svg> },
    metal: { name: 'Metal', bg: 'bg-slate-400', border: 'border-slate-600', text: 'text-slate-900', body: 'bg-slate-200/70', rarity: 'text-slate-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path d="M12 1.5a.75.75 0 0 1 .75.75V6h-1.5V2.25A.75.75 0 0 1 12 1.5ZM11.25 6h1.5v1.5h-1.5V6ZM12 22.5a.75.75 0 0 1-.75-.75V18h1.5v3.75a.75.75 0 0 1-.75.75ZM11.25 18h1.5v-1.5h-1.5V18ZM2.25 12a.75.75 0 0 1 .75-.75H6v1.5H3a.75.75 0 0 1-.75-.75ZM6 12.75h1.5v-1.5H6v1.5ZM21.75 12a.75.75 0 0 1-.75.75H18v-1.5h3a.75.75 0 0 1 .75.75ZM18 11.25h-1.5v1.5H18v-1.5Z" /><path fillRule="evenodd" d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM9.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0Z" clipRule="evenodd" /></svg> },
    dragon: { name: 'Dragon', bg: 'bg-indigo-400', border: 'border-indigo-600', text: 'text-indigo-900', body: 'bg-indigo-200/70', rarity: 'text-indigo-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path d="M15.75 2.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V3.852L13.62 4.93a.75.75 0 0 1-.68-1.298l2.33-1.222a.75.75 0 0 1 .73-.152ZM8.25 2.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V3.852L6.12 4.93a.75.75 0 0 1-.68-1.298l2.33-1.222a.75.75 0 0 1 .73-.152ZM12 6.75a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75Z" /><path fillRule="evenodd" d="M9.986 16.03a.75.75 0 0 1 .632-.825l1.384-.23c.31-.052.544.296.398.58l-1.164 2.283a.75.75 0 0 1-1.398-.71l.148-.288ZM13.38 15.205a.75.75 0 0 1 1.03.58l-1.164 2.283a.75.75 0 0 1-1.398-.71l1.384-.23a.75.75 0 0 1 .148-.213Z" clipRule="evenodd" /></svg> },
    colorless: { name: 'Colorless', bg: 'bg-slate-300', border: 'border-slate-500', text: 'text-slate-900', body: 'bg-slate-200/70', rarity: 'text-slate-800', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={POKEMON_TYPE_ICON_CLASS}><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z" /><path fillRule="evenodd" d="M3.522 9.47a.75.75 0 0 1 1.054-.022L6 10.584V9a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1 0-1.5h1.084l-1.04-1.158a.75.75 0 0 1-.022-1.054Z" clipRule="evenodd" /><path d="M12 18.75a.75.75 0 0 1-.75-.75v-2.25a.75.75 0 0 1 1.5 0V18a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M19.43 14.452a.75.75 0 0 1-1.054.022L17.25 13.316v1.584a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5h-1.084l1.04 1.158a.75.75 0 0 1 .022 1.054Z" clipRule="evenodd" /><path d="M2.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Z" /><path d="M18 12.75a.75.75 0 0 1-.75-.75h-2.25a.75.75 0 0 1 0-1.5H18a.75.75 0 0 1 .75.75Z" /></svg> },
};

// --- GAME RULES ---
// Fix: Add CARD_EMOJIS constant for Quest Card creation.
export const CARD_EMOJIS = ['💻', '📄', '🚀', '🧠', '💼', '📈', '💡', '🎨', '🛠️', '🌐', '🤖', '🎮', '⛩️', '🗾'];
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
