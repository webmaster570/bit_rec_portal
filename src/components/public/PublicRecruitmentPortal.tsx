import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { PostConfig, RecruitmentDrive } from '../../types';
import { THEME_CONFIGS } from '../../themeStyles';
import {
  Search,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  Download,
  Users,
  CheckCircle2,
  BookOpen,
  Info,
  DollarSign,
  Send,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface PublicRecruitmentPortalProps {
  onApplyForPost: (driveId: string, postId: string, postTitle: string) => void;
  onRequestLogin: (postTitle: string) => void;
  onRequestRegister: () => void;
}

export const PublicRecruitmentPortal: React.FC<PublicRecruitmentPortalProps> = ({
  onApplyForPost,
  onRequestLogin,
  onRequestRegister,
}) => {
  const { drives, departments, isLoggedIn, branding, setSelectedDriveId, setSelectedPostId, setActiveTab } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [expandedSyllabusPostId, setExpandedSyllabusPostId] = useState<string | null>(null);
  const [activePdfModalDrive, setActivePdfModalDrive] = useState<RecruitmentDrive | null>(null);

  // Filter drives and posts
  const publishedDrives = drives.filter(
    (d) => d.status === 'applications_open' || d.status === 'published' || d.status === 'screening_in_progress'
  );

  const totalVacanciesAll = publishedDrives.reduce(
    (acc, drive) => acc + drive.posts.reduce((pAcc, post) => pAcc + post.vacanciesTotal, 0),
    0
  );

  const totalPostsCount = publishedDrives.reduce((acc, drive) => acc + drive.posts.length, 0);

  const filterPostMatches = (post: PostConfig) => {
    const matchesDept = selectedDept === 'all' || post.departmentId === selectedDept;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      post.title.toLowerCase().includes(term) ||
      post.departmentName.toLowerCase().includes(term) ||
      post.minQualification.toLowerCase().includes(term) ||
      post.payScale.toLowerCase().includes(term);
    return matchesDept && matchesSearch;
  };

  return (
    <div className={`space-y-8 animate-fadeIn ${theme.rootContainer}`}>
      {/* Top Hero Banner */}
      <div className={`relative overflow-hidden ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-3xl'} bg-gradient-to-r ${theme.heroGradient} text-white p-6 sm:p-8 ${branding.showCardShadow ? 'shadow-xl' : 'shadow-none'} border border-white/10`}>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/80">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{branding.title}</span>
          </div>

          <h1 className={`text-2xl sm:text-3xl ${theme.headingFont} text-white leading-snug`}>
            {branding.subtitle || 'Current Recruitment Advertisements & Job Opportunities'}
          </h1>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl">
            Explore official recruitment notices for Faculty, Administrative, and Technical positions. Review category-wise vacancy breakdowns, eligibility criteria, and submit your online application.
          </p>

          {!isLoggedIn && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onRequestLogin('General Recruitment')}
                className={`px-6 py-2.5 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-50 transition flex items-center gap-2`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Login</span>
              </button>
              <button
                onClick={onRequestRegister}
                className={`px-6 py-2.5 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} bg-white/10 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs shadow-md hover:bg-white/20 transition flex items-center gap-2`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Applicant Account</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Banner */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{publishedDrives.length} Active Advertisements</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-300" />
              <span>{totalPostsCount} Configured Positions</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-300" />
              <span>{totalVacanciesAll} Total Sanctioned Vacancies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-5 space-y-4`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by post title, department name, qualification or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${theme.focusColor} shadow-2xs`}
            />
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none ${theme.focusColor} shadow-2xs`}
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Drive Listings */}
      <div className="space-y-6">
        {publishedDrives.length === 0 ? (
          <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} text-center p-12 text-slate-500`}>
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No active recruitment advertisements found matching your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search keyword or selecting "All Departments".</p>
          </div>
        ) : (
          publishedDrives.map((drive) => {
            const matchingPosts = drive.posts.filter(filterPostMatches);
            if (matchingPosts.length === 0 && (searchTerm || selectedDept !== 'all')) {
              return null;
            }

            return (
              <div
                key={drive.id}
                className={`${theme.cardBase} ${branding.showCardShadow ? 'shadow-lg hover:shadow-xl' : 'shadow-none'} overflow-hidden transition border border-slate-100/50`}
              >
                {/* Drive Header Bar */}
                <div className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${branding.theme === 'industrial_heavy' ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white'}`}>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold">
                        Advt No: {drive.advtNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                        {drive.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h2 className={`text-lg ${theme.headingFont} text-white tracking-tight`}>{drive.title}</h2>
                    <p className="text-xs text-slate-300">{drive.organization} — Official Recruitment Notification</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setActivePdfModalDrive(drive)}
                      className={`${theme.secondaryButton} px-3.5 py-2 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>View Gazette PDF</span>
                    </button>
                  </div>
                </div>

                {/* Drive Important Dates Matrix */}
                <div className={`${branding.theme === 'tech_startup' ? 'bg-slate-900/50' : 'bg-slate-50'} border-b p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className={`w-4 h-4 ${theme.accentColor} shrink-0`} />
                    <div>
                      <span className="text-[10px] uppercase font-bold opacity-60 block">Opening Date</span>
                      <span className="font-semibold">{new Date(drive.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold opacity-60 block">Closing Date</span>
                      <span className="font-semibold text-rose-600">{new Date(drive.closingDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold opacity-60 block">Fee Deadline</span>
                      <span className="font-semibold">{new Date(drive.feeDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BookOpen className={`w-4 h-4 ${theme.accentColor} shrink-0`} />
                    <div>
                      <span className="text-[10px] uppercase font-bold opacity-60 block">Tentative Exam</span>
                      <span className="font-semibold">{drive.examDate || 'Q3 2026'}</span>
                    </div>
                  </div>
                </div>

                {/* Posts Breakdown List */}
                <div className="p-6 space-y-8">
                  {matchingPosts.map((post) => {
                    const isSyllabusExpanded = expandedSyllabusPostId === post.id;

                    return (
                      <div 
                        key={post.id} 
                        className={`group relative p-6 transition-all duration-300 border-l-4 border-l-blue-600 bg-white/40 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-2xl'} shadow-none border border-slate-100/30`}
                      >
                        {/* 1. Header: Title & Status Badge */}
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-lg sm:text-xl font-bold text-slate-900 ${theme.headingFont}`}>
                            {post.title}
                          </h3>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${branding.theme === 'industrial_heavy' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                            {drive.status === 'applications_open' ? 'Open' : drive.status.replace('_', ' ')}
                          </div>
                        </div>

                        {/* 2. Subtitle: Department */}
                        <div className="text-sm font-medium text-slate-500 mb-4">
                          {post.departmentName}
                        </div>

                        {/* 3. Description / Summary */}
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2 max-w-3xl">
                          Joining as {post.title} requires {post.minQualification}. This is a {post.payScale} sanctioned position under the {post.departmentName} unit.
                        </p>

                        {/* 4. Meta Row: Location, Salary, Posted/Deadline (Matching Screenshot) */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] sm:text-xs text-slate-500 mb-6">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 opacity-70" />
                            <span>Main Campus</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 opacity-70" />
                            <span>{post.payScale}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 opacity-70" />
                            <span>Ends {new Date(drive.closingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* 5. Details Section (Vertical breakdown as requested in step 1) */}
                        <div className="space-y-6 mb-8 border-t border-slate-50 pt-6">
                           {/* Vacancy Breakdown */}
                           {drive.showCategoryRow !== false && (
                             <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black opacity-30 uppercase tracking-widest">
                                   <Users className="w-3.5 h-3.5" />
                                   <span>Vacancy Breakdown</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {[
                                      { label: 'UR', count: post.vacanciesBreakdown.UR },
                                      { label: 'OBC', count: post.vacanciesBreakdown.OBC },
                                      { label: 'SC', count: post.vacanciesBreakdown.SC },
                                      { label: 'ST', count: post.vacanciesBreakdown.ST },
                                      { label: 'EWS', count: post.vacanciesBreakdown.EWS },
                                      { label: 'PwD', count: post.vacanciesBreakdown.PwD }
                                   ].map(v => (
                                      <div key={v.label} className={`flex flex-col items-center justify-center border border-slate-100 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} px-3 py-1.5 min-w-[55px] bg-slate-50/50`}>
                                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{v.label}</span>
                                         <span className="text-xs font-black text-slate-800 tabular-nums">{v.count}</span>
                                      </div>
                                   ))}
                                   <div className={`flex flex-col items-center justify-center ${theme.primaryButton} ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} px-4 py-1.5 min-w-[60px] shadow-xs`}>
                                      <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter">Total</span>
                                      <span className="text-xs font-black tabular-nums">{post.vacanciesTotal}</span>
                                   </div>
                                </div>
                             </div>
                           )}

                           {/* Qualification */}
                           <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black opacity-30 uppercase tracking-widest">
                                 <GraduationCap className="w-3.5 h-3.5" />
                                 <span>Qualification</span>
                              </div>
                              <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                                 &ldquo;{post.minQualification}&rdquo;
                              </p>
                           </div>

                           {/* Eligibility Summary */}
                           <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black opacity-30 uppercase tracking-widest">
                                 <ShieldCheck className="w-3.5 h-3.5" />
                                 <span>Eligibility Summary</span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-800">
                                 <span className="flex items-center gap-1.5"><Briefcase className={`w-3.5 h-3.5 ${theme.accentColor}`} /> {post.requiredExperienceYears}Y Experience</span>
                                 <span className="flex items-center gap-1.5"><Clock className={`w-3.5 h-3.5 ${theme.accentColor}`} /> {post.minAge}-{post.maxAge}Y Age</span>
                              </div>
                           </div>

                           {/* Fee Age/date etc */}
                           <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-black opacity-30 uppercase tracking-widest">
                                 <Info className="w-3.5 h-3.5" />
                                 <span>Fee & Dates</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold">
                                 <div className="flex items-center gap-1.5 text-emerald-700">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>Fee: ₹{post.applicationFee}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-rose-700">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Closing: {new Date(drive.closingDate).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* 6. Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div className="flex items-center gap-6">
                             <button
                               onClick={() => {
                                 setSelectedDriveId(drive.id);
                                 setSelectedPostId(post.id);
                                 setActiveTab('notice_detail');
                               }}
                               className={`text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/link transition-all`}
                             >
                               <span>View Details</span>
                               <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                             </button>

                             <button
                               onClick={() => setExpandedSyllabusPostId(isSyllabusExpanded ? null : post.id)}
                               className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition"
                             >
                               <BookOpen className="w-3.5 h-3.5" />
                               <span>{isSyllabusExpanded ? 'Hide Syllabus' : 'Syllabus & Pattern'}</span>
                               {isSyllabusExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                             </button>
                           </div>

                           <button
                             onClick={() => {
                               if (isLoggedIn) onApplyForPost(drive.id, post.id, post.title);
                               else onRequestLogin(post.title);
                             }}
                             className={`w-full sm:w-auto px-10 py-2.5 ${theme.primaryButton} text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm`}
                           >
                             <Send className="w-3.5 h-3.5" />
                             <span>Apply Now</span>
                           </button>
                        </div>

                        {isSyllabusExpanded && (
                          <div className={`mt-6 p-5 ${branding.theme === 'tech_startup' ? 'bg-slate-900/80 border-indigo-500/20' : 'bg-slate-50 border-slate-100'} border ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-2xl'} text-xs space-y-3 animate-in slide-in-from-top-2 duration-300`}>
                            <div className="flex items-center space-x-2 font-bold text-slate-800">
                              <BookOpen className={`w-4 h-4 ${theme.accentColor}`} />
                              <span>Examination Methodology</span>
                            </div>
                            
                            {drive.syllabusContent ? (
                              <div className={`text-[11px] whitespace-pre-wrap font-mono leading-relaxed bg-white/50 p-4 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} border border-slate-100`}>
                                {drive.syllabusContent}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                 <div className="bg-white p-3 rounded-xl border border-slate-100">
                                    <div className={`font-black ${theme.accentColor} text-[10px] mb-1 uppercase`}>Screening</div>
                                    <div className="text-[10px] text-slate-500">Initial academic audit.</div>
                                 </div>
                                 <div className="bg-white p-3 rounded-xl border border-slate-100">
                                    <div className={`font-black ${theme.accentColor} text-[10px] mb-1 uppercase`}>Written</div>
                                    <div className="text-[10px] text-slate-500">Domain competency test.</div>
                                 </div>
                                 <div className="bg-white p-3 rounded-xl border border-slate-100">
                                    <div className={`font-black ${theme.accentColor} text-[10px] mb-1 uppercase`}>Interview</div>
                                    <div className="text-[10px] text-slate-500">Final board evaluation.</div>
                                 </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {activePdfModalDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} w-full max-w-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className={`font-bold text-sm ${theme.headingFont}`}>Official Advertisement Gazette Document</h3>
                <p className="text-xs opacity-60">{activePdfModalDrive.advtNumber} — {activePdfModalDrive.title}</p>
              </div>
              <button
                onClick={() => setActivePdfModalDrive(null)}
                className={`${theme.secondaryButton} px-2.5 py-1 text-xs font-bold`}
              >
                Close
              </button>
            </div>

            <div className={`p-6 bg-slate-50 border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} text-center space-y-4 max-h-[60vh] overflow-y-auto`}>
              <FileText className={`w-12 h-12 ${theme.accentColor} mx-auto`} />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">{activePdfModalDrive.title}</h4>
                <p className="text-[10px] font-mono opacity-60 uppercase">{activePdfModalDrive.advtNumber}</p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => alert('Simulated PDF Download initiated.')}
                  className={`${theme.primaryButton} px-4 py-2 font-bold text-xs transition flex items-center space-x-1.5`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} p-6 space-y-4`}>
        <h3 className={`text-sm font-bold flex items-center space-x-2 ${theme.headingFont}`}>
          <Info className={`w-4 h-4 ${theme.accentColor}`} />
          <span>General Applicant Helpdesk & Registration Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-4 bg-white/50 border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} space-y-1`}>
             <span className="font-bold block">1. Online Account Creation</span>
             <p className="opacity-70 leading-snug text-[11px]">Applicants must register using their active email and mobile number.</p>
          </div>
          <div className={`p-4 bg-white/50 border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} space-y-1`}>
             <span className="font-bold block">2. Document Formats</span>
             <p className="opacity-70 leading-snug text-[11px]">Upload JPG/PNG photo (200KB) and signature (100KB). Certificates in PDF.</p>
          </div>
          <div className={`p-4 bg-white/50 border border-slate-200 ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} space-y-1`}>
             <span className="font-bold block">3. Payment & Exemption</span>
             <p className="opacity-70 leading-snug text-[11px]">Integrated gateway. SC/ST/PwD/Women are exempted from payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
