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
        // Fallback: search for login button in header or similar, 
        // but since we are in App.tsx we know it's passed.
        // If not, at least don't navigate away.
        console.warn('onRequestLogin not provided to PublicNoticeDetail');
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
            className="p-2 rounded-xl bg-white text-slate-500 hover:bg-slate-50 transition shadow-sm"
            title="Share Notice"
            onClick={() => alert('Notice link copied to clipboard.')}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className={`${theme.cardBase} ${branding.showCardShadow ? 'shadow-xl' : 'shadow-none'} overflow-hidden flex flex-col lg:flex-row`}>
        {/* Left Side: Notice Content */}
        <div className="flex-1 p-6 sm:p-10 lg:p-12 space-y-10 border-r border-slate-50">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase tracking-widest">
                Advt No: {drive.advtNumber}
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase tracking-widest">
                Post Code: {post.postCode}
              </span>
              <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                Applications Open
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl ${theme.headingFont} leading-tight tracking-tight text-slate-900`}>
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-500 font-bold text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>{post.departmentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                <span>Main University Campus</span>
              </div>
            </div>
          </div>


          {/* Quick Stats Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <DollarSign className="w-4 h-4" />
                <span>Pay Scale</span>
              </div>
              <span className="text-base sm:text-lg font-black block">{post.payScale}</span>
            </div>
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <Users className="w-4 h-4" />
                <span>Total Vacancies</span>
              </div>
              <span className={`text-base sm:text-lg font-black block ${theme.accentColor}`}>{post.vacanciesTotal} Posts</span>
            </div>
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl'} bg-slate-50 space-y-2`}>
              <div className="flex items-center gap-2 text-[10px] opacity-40 font-black uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <span>Closing Date</span>
              </div>
              <span className="text-base sm:text-lg font-black block text-rose-600">{new Date(drive.closingDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className={`p-5 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl'} bg-slate-50 space-y-2`}>
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
                  { label: 'Unreserved (UR)', count: post.vacanciesBreakdown.UR, color: 'bg-slate-100' },
                  { label: 'OBC (NCL)', count: post.vacanciesBreakdown.OBC, color: 'bg-blue-50' },
                  { label: 'Scheduled Caste', count: post.vacanciesBreakdown.SC, color: 'bg-purple-50' },
                  { label: 'Scheduled Tribe', count: post.vacanciesBreakdown.ST, color: 'bg-orange-50' },
                  { label: 'Economical (EWS)', count: post.vacanciesBreakdown.EWS, color: 'bg-teal-50' },
                  { label: 'PwD Category', count: post.vacanciesBreakdown.PwD, color: 'bg-rose-50' },
                ].map((cat) => (
                  <div key={cat.label} className={`p-4 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-2xl'} ${cat.color} text-center transition hover:scale-105 duration-200`}>
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
              <div className={`p-8 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl'} bg-slate-50 space-y-6 relative overflow-hidden`}>
                <GraduationCap className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-200/50 -rotate-12" />
                <div className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <span className={`text-xs font-black ${theme.accentColor} uppercase tracking-widest block`}>Essential Qualification</span>
                    <p className="text-sm font-bold leading-relaxed text-slate-700 italic border-l-4 border-slate-200 pl-4 bg-white/50 py-3 rounded-r-xl">
                      &ldquo;{post.minQualification}&rdquo;
                    </p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
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
              <div className={`p-8 ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800' : 'rounded-3xl'} bg-slate-50 space-y-5 relative overflow-hidden`}>
                <ShieldCheck className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-200/50 rotate-12" />
                <div className="relative z-10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold opacity-40 uppercase block mb-1">Minimum Age</span>
                      <span className="text-lg font-black">{post.minAge} Years</span>
                    </div>
                    <div className="bg-white/70 p-4 rounded-2xl">
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
            <div className={`p-8 bg-white ${branding.theme === 'industrial_heavy' ? 'rounded-none border-2 border-slate-800 shadow-none' : 'rounded-3xl shadow-sm'} grid grid-cols-1 md:grid-cols-3 gap-8 relative`}>
               <div className="space-y-3 relative">
                 <div className={`w-10 h-10 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-sm font-black shadow-inner`}>1</div>
                 <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Screening & Shortlisting</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">Initial scrutiny of academic API scores, experience weightage, and supporting document verification against essential criteria.</p>
               </div>
               <div className="space-y-3 relative">
                 <div className="hidden md:block absolute -left-4 top-5 w-px h-12 bg-slate-50"></div>
                 <div className={`w-10 h-10 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-sm font-black shadow-inner`}>2</div>
                 <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Written / Skill Assessment</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">Domain competency written examination followed by practical skill evaluation for technical positions where applicable.</p>
               </div>
               <div className="space-y-3 relative">
                 <div className="hidden md:block absolute -left-4 top-5 w-px h-12 bg-slate-50"></div>
                 <div className={`w-10 h-10 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-slate-100 ${theme.accentColor} flex items-center justify-center text-sm font-black shadow-inner`}>3</div>
                 <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">Personal Interview</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">Final evaluation by the university expert selection committee to assess suitability, leadership, and domain expertise.</p>
               </div>
            </div>
          </div>

        </div>

        {/* Right Side: Action Sidebar (Image 1 Style) */}
        <div className="w-full lg:w-96 bg-slate-50/40 p-8 sm:p-12 flex flex-col items-center justify-start gap-6">
          <div className="w-full space-y-4">
            <div className="text-center space-y-1 pb-4 border-b border-slate-100">
               <div className="flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest text-emerald-600">
                 <Calendar className="w-4 h-4" />
                 <span>Deadline: {new Date(drive.closingDate).toLocaleDateString()}</span>
               </div>
               <p className="text-[10px] text-slate-400 font-bold">Applications Close at 11:59 PM</p>
            </div>

            <button 
              onClick={handleApply}
              className={`w-full py-4 rounded-2xl ${theme.primaryButton} text-xs font-black transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10 active:scale-95`}
            >
              <Send className="w-4 h-4" />
              <span>Apply Online Now</span>
            </button>

            <button 
              onClick={() => alert('Simulated Gazatte Download')}
              className="w-full py-3.5 rounded-2xl bg-white text-slate-900 text-xs font-black transition flex items-center justify-center gap-2 shadow-sm border border-slate-100 hover:bg-slate-50"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download Official Notice</span>
            </button>
            
            <div className="pt-8 space-y-6">
               <div className="flex items-start gap-4">
                 <div className={`w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0`}>
                   <Info className="w-5 h-5 text-amber-500" />
                 </div>
                 <div className="space-y-0.5">
                   <h4 className="font-black text-[10px] text-slate-900 uppercase tracking-wider">Helpdesk</h4>
                   <p className="text-[10px] text-slate-500 leading-tight">Technical queries? Contact recruitment@university.edu</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                 <div className={`w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0`}>
                   <FileText className="w-5 h-5 text-indigo-500" />
                 </div>
                 <div className="space-y-0.5">
                   <h4 className="font-black text-[10px] text-slate-900 uppercase tracking-wider">Checklist</h4>
                   <p className="text-[10px] text-slate-500 leading-tight">Keep scans of all academic & experience proofs ready.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};
