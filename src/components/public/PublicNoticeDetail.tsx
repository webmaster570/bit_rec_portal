import React, { useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { THEME_CONFIGS } from '../../themeStyles';
import {
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
  ArrowLeft,
  Share2,
  FileText,
} from 'lucide-react';

interface PublicNoticeDetailProps {
  onRequestLogin?: () => void;
  onRequestRegister?: () => void;
}

export const PublicNoticeDetail: React.FC<PublicNoticeDetailProps> = ({
  onRequestLogin,
  onRequestRegister,
}) => {
  const { 
    drives, 
    selectedDriveId, 
    selectedPostId, 
    setActiveTab, 
    isLoggedIn, 
    branding,
    setSelectedPostId,
    setSelectedDriveId
  } = usePortal();
  
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const drive = drives.find(d => d.id === selectedDriveId);
  const post = drive?.posts.find(p => p.id === selectedPostId);

  if (!drive || !post) {
    return (
      <div className="text-center py-20 space-y-4">
        <Info className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Notice Not Found</h2>
        <p className="text-slate-500">The recruitment notice you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => setActiveTab('public_recruitment')}
          className={`${theme.primaryButton} px-6 py-2 rounded-xl text-xs font-bold`}
        >
          Return to Public Notices
        </button>
      </div>
    );
  }

  const handleBack = () => {
    setActiveTab('public_recruitment');
    // We keep selected IDs in case user comes back, or we could clear them
  };

  const handleApply = () => {
    if (isLoggedIn) {
      setActiveTab('applicant_portal');
    } else {
      if (onRequestLogin) {
        onRequestLogin();
      } else {
        setActiveTab('public_recruitment');
      }
    }
  };

  return (
    <div className={`space-y-6 animate-fadeIn pb-20 ${theme.rootContainer}`}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Notices</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition shadow-sm"
            title="Share Notice"
            onClick={() => alert('Notice link copied to clipboard.')}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className={`${theme.cardBase} ${branding.showCardShadow ? 'shadow-xl' : 'shadow-none'} overflow-hidden border border-slate-100`}>
        {/* Header Section */}
        <div className="relative p-6 sm:p-10 bg-slate-900 text-white overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 font-mono text-[10px] font-bold uppercase tracking-widest">
                Advt No: {drive.advtNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 font-mono text-[10px] font-bold uppercase tracking-widest">
                Post Code: {post.postCode}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                Applications Open
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl ${theme.headingFont} leading-tight tracking-tight text-white max-w-4xl`}>
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white/70 font-bold text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>{post.departmentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                <span>Main University Campus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 lg:p-12 space-y-12">
          {/* Quick Stats Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl border border-slate-100'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <DollarSign className="w-4 h-4" />
                <span>Pay Scale</span>
              </div>
              <span className="text-base sm:text-lg font-black block">{post.payScale}</span>
            </div>
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl border border-slate-100'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <Users className="w-4 h-4" />
                <span>Total Vacancies</span>
              </div>
              <span className={`text-base sm:text-lg font-black block ${theme.accentColor}`}>{post.vacanciesTotal} Posts</span>
            </div>
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl border border-slate-100'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <span>Closing Date</span>
              </div>
              <span className="text-base sm:text-lg font-black block text-rose-600">{new Date(drive.closingDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl border border-slate-100'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <Info className="w-4 h-4" />
                <span>Application Fee</span>
              </div>
              <span className="text-base sm:text-lg font-black block">₹{post.applicationFee}</span>
            </div>
          </div>

          {/* Section: Category Distribution */}
          {drive.showCategoryRow !== false && (
            <div className="space-y-4">
              <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${theme.headingFont}`}>
                <div className={`w-8 h-1 ${theme.accentColor} rounded-full`}></div>
                <span>Category-wise Vacancy Breakdown</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Unreserved (UR)', count: post.vacanciesBreakdown.UR, color: 'bg-slate-100 border-slate-200' },
                  { label: 'OBC (NCL)', count: post.vacanciesBreakdown.OBC, color: 'bg-blue-50 border-blue-100' },
                  { label: 'Scheduled Caste', count: post.vacanciesBreakdown.SC, color: 'bg-purple-50 border-purple-100' },
                  { label: 'Scheduled Tribe', count: post.vacanciesBreakdown.ST, color: 'bg-orange-50 border-orange-100' },
                  { label: 'Economical (EWS)', count: post.vacanciesBreakdown.EWS, color: 'bg-teal-50 border-teal-100' },
                  { label: 'PwD Category', count: post.vacanciesBreakdown.PwD, color: 'bg-rose-50 border-rose-100' },
                ].map((cat) => (
                  <div key={cat.label} className={`p-4 border ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl'} ${cat.color} text-center transition hover:scale-105 duration-200`}>
                    <div className="text-[10px] font-bold opacity-50 uppercase mb-1">{cat.label}</div>
                    <div className="text-xl font-black">{cat.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Detailed Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Academic */}
            <div className="space-y-6">
              <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${theme.headingFont}`}>
                <div className={`w-8 h-1 ${theme.accentColor} rounded-full`}></div>
                <span>Academic & Professional Qualifications</span>
              </h3>
              <div className={`p-8 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl border border-slate-100'} bg-slate-50 space-y-6 relative overflow-hidden`}>
                <GraduationCap className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-200/50 -rotate-12" />
                <div className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <span className={`text-xs font-black ${theme.accentColor} uppercase tracking-widest block`}>Essential Qualification</span>
                    <p className="text-sm font-bold leading-relaxed text-slate-700 italic border-l-4 border-slate-200 pl-4 bg-white/50 py-3 rounded-r-xl">
                      &ldquo;{post.minQualification}&rdquo;
                    </p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <span className={`text-xs font-black ${theme.accentColor} uppercase tracking-widest block`}>Experience Requirement</span>
                    <div className="flex items-start gap-3 bg-white/50 p-4 rounded-xl">
                      <Briefcase className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                        Minimum <span className="text-slate-900 font-black">{post.requiredExperienceYears} years</span> of relevant post-qualification professional experience as per university guidelines.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: General & Eligibility */}
            <div className="space-y-6">
              <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${theme.headingFont}`}>
                <div className={`w-8 h-1 ${theme.accentColor} rounded-full`}></div>
                <span>General Eligibility & Age Criteria</span>
              </h3>
              <div className={`p-8 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl border border-slate-100'} bg-slate-50 space-y-5 relative overflow-hidden`}>
                <ShieldCheck className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-200/50 rotate-12" />
                <div className="relative z-10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold opacity-40 uppercase block mb-1">Minimum Age</span>
                      <span className="text-lg font-black">{post.minAge} Years</span>
                    </div>
                    <div className="bg-white/70 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold opacity-40 uppercase block mb-1">Maximum Age</span>
                      <span className="text-lg font-black">{post.maxAge} Years</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Probation Period</span>
                      </div>
                      <span className="text-xs font-black">24 Months</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Place of Posting</span>
                      </div>
                      <span className="text-xs font-black">Main University Campus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Selection Methodology */}
          <div className="space-y-6">
            <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${theme.headingFont}`}>
              <div className={`w-8 h-1 ${theme.accentColor} rounded-full`}></div>
              <span>Selection Methodology & Evaluation Pattern</span>
            </h3>
            <div className={`p-8 bg-white border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800 shadow-none' : 'rounded-3xl shadow-sm'} grid grid-cols-1 md:grid-cols-3 gap-8 relative`}>
               <div className="space-y-3 relative">
                 <div className={`w-10 h-10 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-sm font-black shadow-inner`}>1</div>
                 <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Screening & Shortlisting</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">Initial scrutiny of academic API scores, experience weightage, and supporting document verification against essential criteria.</p>
               </div>
               <div className="space-y-3 relative">
                 <div className="hidden md:block absolute -left-4 top-5 w-px h-12 bg-slate-100"></div>
                 <div className={`w-10 h-10 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-sm font-black shadow-inner`}>2</div>
                 <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Written / Skill Assessment</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">Domain competency written examination followed by practical skill evaluation for technical positions where applicable.</p>
               </div>
               <div className="space-y-3 relative">
                 <div className="hidden md:block absolute -left-4 top-5 w-px h-12 bg-slate-100"></div>
                 <div className={`w-10 h-10 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-sm font-black shadow-inner`}>3</div>
                 <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Personal Interview</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">Final evaluation by the university expert selection committee to assess suitability, leadership, and domain expertise.</p>
               </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className={`p-8 ${branding.theme === 'industrial_heavy' ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-100 rounded-3xl'} flex flex-col md:flex-row items-center justify-between gap-6`}>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 font-black text-sm uppercase tracking-widest text-emerald-600">
                <Calendar className="w-4 h-4" />
                <span>Deadline: {new Date(drive.closingDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">Make sure to complete the online application before the window closes.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => alert('Simulated Gazatte Download')}
                className={`${theme.secondaryButton} px-8 py-3.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-sm`}
              >
                <Download className="w-4 h-4" />
                <span>Official PDF</span>
              </button>
              <button 
                onClick={handleApply}
                className={`${theme.primaryButton} px-12 py-4 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95`}
              >
                <Send className="w-4 h-4" />
                <span>Apply Online Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${theme.cardBase} p-6 border border-slate-100 flex items-start gap-4`}>
          <div className={`w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0`}>
            <Info className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Need Assistance?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Contact our recruitment helpdesk for any technical queries regarding the application portal or document uploads.</p>
          </div>
        </div>
        <div className={`${theme.cardBase} p-6 border border-slate-100 flex items-start gap-4`}>
          <div className={`w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0`}>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Document Checklist</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Ensure you have scanned copies of all academic transcripts, experience certificates, and category proofs ready.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
