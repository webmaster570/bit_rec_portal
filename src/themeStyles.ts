import { PortalTheme } from './types';

export interface ThemeConfig {
  rootContainer: string;
  mainBg: string;
  cardBase: string;
  sidebarBase: string;
  headerBase: string;
  accentColor: string;
  primaryButton: string;
  headingFont: string;
}

export const THEME_CONFIGS: Record<PortalTheme, ThemeConfig> = {
  classic: {
    rootContainer: 'font-sans bg-slate-50 antialiased text-slate-900',
    mainBg: 'bg-white border-t border-slate-200',
    cardBase: 'bg-white border-slate-200 shadow-sm rounded-xl',
    sidebarBase: 'bg-white border-r border-slate-200',
    headerBase: 'bg-white border-b border-slate-200',
    accentColor: 'text-indigo-600',
    primaryButton: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    headingFont: 'font-bold tracking-tight',
  },
  modern: {
    rootContainer: 'font-sans bg-zinc-50 antialiased text-zinc-900',
    mainBg: 'bg-white/80 backdrop-blur-md border-t border-zinc-200',
    cardBase: 'bg-white border-zinc-200 shadow-lg shadow-zinc-200/50 rounded-2xl',
    sidebarBase: 'bg-zinc-50 border-r border-zinc-200',
    headerBase: 'bg-white/80 backdrop-blur-md border-b border-zinc-200',
    accentColor: 'text-violet-600',
    primaryButton: 'bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-md',
    headingFont: 'font-extrabold tracking-tight',
  },
  crimson: {
    rootContainer: 'font-sans bg-rose-50/30 antialiased text-slate-900',
    mainBg: 'bg-white border-t border-rose-100',
    cardBase: 'bg-white border-rose-200 shadow-sm rounded-xl',
    sidebarBase: 'bg-rose-900 text-white border-r border-rose-800',
    headerBase: 'bg-white border-b border-rose-200',
    accentColor: 'text-rose-600',
    primaryButton: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    headingFont: 'font-bold tracking-tight text-rose-900',
  },
  academic: {
    rootContainer: 'font-serif bg-[#fdfcf8] antialiased text-stone-900',
    mainBg: 'bg-white border-t border-stone-200',
    cardBase: 'bg-white border-stone-200 shadow-md rounded-lg',
    sidebarBase: 'bg-[#1a365d] text-white border-r border-blue-900',
    headerBase: 'bg-[#fdfcf8] border-b border-stone-200',
    accentColor: 'text-amber-700',
    primaryButton: 'bg-amber-700 hover:bg-amber-800 text-white rounded-md',
    headingFont: 'font-serif font-bold text-blue-900',
  },
  nature: {
    rootContainer: 'font-sans bg-emerald-50/20 antialiased text-slate-900',
    mainBg: 'bg-white border-t border-emerald-100',
    cardBase: 'bg-white border-emerald-100 shadow-sm rounded-2xl',
    sidebarBase: 'bg-emerald-800 text-white border-r border-emerald-900',
    headerBase: 'bg-white border-b border-emerald-100',
    accentColor: 'text-emerald-700',
    primaryButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    headingFont: 'font-bold text-emerald-900',
  },
  sapphire: {
    rootContainer: 'font-sans bg-sky-50/30 antialiased text-slate-900',
    mainBg: 'bg-white border-t border-sky-100',
    cardBase: 'bg-white border-sky-100 shadow-md rounded-xl',
    sidebarBase: 'bg-slate-900 text-white border-r border-slate-800',
    headerBase: 'bg-white border-b border-sky-200 shadow-sm',
    accentColor: 'text-sky-700',
    primaryButton: 'bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sky-200/50',
    headingFont: 'font-bold tracking-tight text-slate-900',
  },
};
