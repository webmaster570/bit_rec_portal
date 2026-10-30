import React from 'react';
import { PostConfig, RecruitmentDrive } from '../../types';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  X,
  Briefcase,
  Building2,
  GraduationCap,
  Clock,
  DollarSign,
  Users,
  ShieldCheck,
  BookOpen,
  Info,
  MapPin,
  Calendar,
  Send,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface JobDetailModalProps {
  post: PostConfig;
  drive: RecruitmentDrive;
  isOpen: boolean;
  onClose: () => void;
  onApply: (driveId: string, postId: string, postTitle: string) => void;
  isLoggedIn: boolean;
  onRequestLogin: (postTitle: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  post,
  drive,
  isOpen,
  onClose,
  onApply,
  isLoggedIn,
  onRequestLogin,
}) => {
  const { branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${theme.rootContainer}`}>
      <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} w-full max-w-3xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className={`relative p-6 sm:p-8 shrink-0 bg-slate-900 text-white`}>
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={onClose}
              className={`p-2 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-white/10 hover:bg-white/20 text-white transition shadow-sm`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white/80 border border-white/20 font-mono text-[10px] font-bold">
                Post Code: {post.postCode}
              </span>
              <span className={`px-2 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[10px] font-bold uppercase`}>
                Sanctioned Vacancy
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl ${theme.headingFont} leading-tight tracking-tight text-white`}>
              {post.title}
            </h2>
            <div className="flex items-center gap-2 text-white/70 font-bold text-sm">
              <Building2 className="w-4 h-4" />
              <span>{post.departmentName}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Job Summary Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl border border-slate-100'} bg-slate-50 space-y-1`}>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Pay Scale</span>
              <span className="text-sm font-black">{post.payScale}</span>
            </div>
            <div className={`p-4 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl border border-slate-100'} bg-slate-50 space-y-1`}>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Total Vacancies</span>
              <span className={`text-sm font-black ${theme.accentColor}`}>{post.vacanciesTotal} Posts</span>
            </div>
            <div className={`p-4 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl border border-slate-100'} bg-slate-50 space-y-1`}>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Application Fee</span>
              <span className="text-sm font-black">₹{post.applicationFee}</span>
            </div>
            <div className={`p-4 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl border border-slate-100'} bg-slate-50 space-y-1`}>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Last Date</span>
              <span className="text-sm font-black text-rose-600">{new Date(drive.closingDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Section: Category Distribution */}
          {drive.showCategoryRow !== false && (
            <div className="space-y-3">
              <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${theme.headingFont}`}>
                <Users className={`w-4 h-4 ${theme.accentColor}`} />
                <span>Category-wise Vacancy Breakdown</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[
                  { label: 'UR', count: post.vacanciesBreakdown.UR, color: 'bg-slate-100' },
                  { label: 'OBC', count: post.vacanciesBreakdown.OBC, color: 'bg-blue-50' },
                  { label: 'SC', count: post.vacanciesBreakdown.SC, color: 'bg-purple-50' },
                  { label: 'ST', count: post.vacanciesBreakdown.ST, color: 'bg-orange-50' },
                  { label: 'EWS', count: post.vacanciesBreakdown.EWS, color: 'bg-teal-50' },
                  { label: 'PwD', count: post.vacanciesBreakdown.PwD, color: 'bg-rose-50' },
                ].map((cat) => (
                  <div key={cat.label} className={`p-3 border border-slate-100 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-slate-800' : 'rounded-2xl'} ${cat.color} text-center ${branding.showCardShadow ? 'shadow-xs' : 'shadow-none'}`}>
                    <div className="text-[9px] font-bold opacity-40 uppercase">{cat.label}</div>
                    <div className="text-sm font-black">{cat.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Eligibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${theme.headingFont}`}>
                <GraduationCap className={`w-4 h-4 ${theme.accentColor}`} />
                <span>Academic Requirements</span>
              </h3>
              <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl border border-slate-100'} bg-slate-50 space-y-3`}>
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold ${theme.accentColor} uppercase`}>Essential Qualification</span>
                  <p className="text-xs font-medium leading-relaxed italic">{post.minQualification}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <span className={`text-[10px] font-bold ${theme.accentColor} uppercase`}>Work Experience</span>
                  <p className="text-xs font-medium leading-relaxed">Minimum {post.requiredExperienceYears} years of post-qualification experience in relevant field.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${theme.headingFont}`}>
                <ShieldCheck className={`w-4 h-4 ${theme.accentColor}`} />
                <span>General Criteria</span>
              </h3>
              <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl border border-slate-100'} bg-slate-50 space-y-3`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60 font-medium">Minimum Age Limit</span>
                  <span className="font-bold">{post.minAge} Years</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60 font-medium">Maximum Age Limit</span>
                  <span className="font-bold">{post.maxAge} Years</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60 font-medium">Probation Period</span>
                  <span className="font-bold">24 Months</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-60 font-medium">Job Location</span>
                  <span className="font-bold">Main Campus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Methodology */}
          <div className="space-y-4">
            <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${theme.headingFont}`}>
              <BookOpen className={`w-4 h-4 ${theme.accentColor}`} />
              <span>Selection Methodology</span>
            </h3>
            <div className={`p-5 bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800 shadow-none' : 'rounded-2xl shadow-xs'} flex flex-col md:flex-row gap-6`}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-[10px] font-black`}>1</div>
                  <span className="text-xs font-bold">Screening & Shortlisting</span>
                </div>
                <p className="text-[11px] opacity-50 leading-relaxed ml-8">Candidates will be shortlisted based on academic API scores and experience weightage.</p>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-[10px] font-black`}>2</div>
                  <span className="text-xs font-bold">Written / Skill Test</span>
                </div>
                <p className="text-[11px] opacity-50 leading-relaxed ml-8">Objective test followed by skill assessment where applicable.</p>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-lg'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-[10px] font-black`}>3</div>
                  <span className="text-xs font-bold">Personal Interview</span>
                </div>
                <p className="text-[11px] opacity-50 leading-relaxed ml-8">Final selection by the university expert selection committee.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2 text-[10px] opacity-50 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>Ensure you have scanned documents ready for upload.</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`${theme.secondaryButton} px-6 py-2.5 text-xs transition flex-1 sm:flex-none`}
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (isLoggedIn) onApply(drive.id, post.id, post.title);
                else onRequestLogin(post.title);
              }}
              className={`${theme.primaryButton} px-10 py-2.5 text-xs transition flex items-center justify-center gap-2 flex-1 sm:flex-none`}
            >
              <Send className="w-4 h-4" />
              <span>Apply Online Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
