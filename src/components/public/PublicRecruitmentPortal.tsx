import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { PostConfig, RecruitmentDrive, RecruitmentCategory, Campus } from '../../types';
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
  const [selectedCategory, setSelectedCategory] = useState<RecruitmentCategory | 'all'>('all');
  const [selectedCampus, setSelectedCampus] = useState<Campus | 'all'>('all');

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
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesCampus = selectedCampus === 'all' || post.campus === selectedCampus;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      post.title.toLowerCase().includes(term) ||
      post.departmentName.toLowerCase().includes(term) ||
      post.minQualification.toLowerCase().includes(term) ||
      post.payScale.toLowerCase().includes(term);
    return matchesDept && matchesCategory && matchesCampus && matchesSearch;
  };

  return (
    <div className={`space-y-8 animate-fadeIn ${theme.rootContainer}`}>
      {/* Top Hero Banner */}
      <div className={`relative overflow-hidden ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-3xl'} bg-gradient-to-r ${theme.heroGradient} text-white p-6 sm:p-8 ${branding.showCardShadow ? 'shadow-xl' : 'shadow-none'} `}>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md  text-xs font-semibold text-white/80">
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
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md  flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{publishedDrives.length} Active Advertisements</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md  flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-300" />
              <span>{totalPostsCount} Configured Positions</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md  flex items-center gap-2">
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
              className={`w-full bg-white  rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${theme.focusColor} shadow-2xs`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Category Filter Pills */}
            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
              {['all', 'Teaching', 'Non-Teaching'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                    selectedCategory === cat
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* Campus Filter */}
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value as any)}
              className={`bg-white border border-slate-100 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase text-slate-800 focus:outline-none ${theme.focusColor} shadow-2xs`}
            >
              <option value="all">All Campuses</option>
              <option value="BIT Mesra">BIT Mesra</option>
              <option value="BIT Noida">BIT Noida</option>
              <option value="BIT Jaipur">BIT Jaipur</option>
              <option value="BIT Patna">BIT Patna</option>
              <option value="BIT Deoghar">BIT Deoghar</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`bg-white border border-slate-100 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase text-slate-800 focus:outline-none ${theme.focusColor} shadow-2xs`}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
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

            const isExpanded = expandedSyllabusPostId === drive.id;

            return (
              <div key={drive.id} className="space-y-4">
                {/* Drive Summary Card (Image 1 Design) */}
                <div className={`${theme.cardBase} ${branding.showCardShadow ? 'shadow-md hover:shadow-lg' : 'shadow-none'} overflow-hidden transition-all duration-300 flex flex-col md:flex-row`}>
                  {/* Left Content Area */}
                  <div className="flex-1 p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                        ADVT NO: {drive.advtNumber}
                      </span>
                      <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider">
                        {drive.status === 'applications_open' ? 'OPEN' : drive.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h2 className={`text-xl sm:text-2xl font-black text-slate-900 leading-tight ${theme.headingFont}`}>
                      {drive.title}
                    </h2>

                    <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                      {drive.description || `Direct recruitment drive for specialized positions at ${drive.organization}. Official vacancy notification for the academic year 2026-2027.`}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-tight">Posted On</span>
                          <span className="text-xs font-bold text-slate-800">{new Date(drive.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-tight">Closing Date</span>
                          <span className="text-xs font-bold text-slate-800 text-rose-600">{new Date(drive.closingDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-tight">Location</span>
                          <span className="text-xs font-bold text-slate-800">Mesra, Ranchi</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar Actions */}
                  <div className="w-full md:w-72 bg-slate-50/40 p-6 flex flex-col justify-center items-center gap-3">
                    <button
                      onClick={() => setExpandedSyllabusPostId(isExpanded ? null : drive.id)}
                      className="w-full py-3 rounded-xl bg-white text-slate-900 text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-xs active:scale-95"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!isExpanded) setExpandedSyllabusPostId(drive.id);
                        const firstPost = matchingPosts[0];
                        if (firstPost) {
                           if (isLoggedIn) onApplyForPost(drive.id, firstPost.id, firstPost.title);
                           else onRequestLogin(firstPost.title);
                        } else {
                           setActiveTab('applicant_portal');
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-[#1e293b] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:bg-slate-900 transition active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>Apply Online</span>
                    </button>

                    <button
                      onClick={() => setActivePdfModalDrive(drive)}
                      className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition mt-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Advertisement</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Section: List of Posts */}
                {isExpanded && (
                  <div className="animate-in slide-in-from-top-4 duration-500 space-y-3 pl-4 md:pl-12 border-l-2 border-slate-100 ml-4 mb-8">
                    <div className="flex items-center gap-3 pb-2 pt-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white pr-3">Advertised Positions ({matchingPosts.length})</span>
                       <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    
                    {matchingPosts.map((post) => (
                      <div key={post.id} className={`${theme.cardBase} ${branding.showCardShadow ? 'shadow-sm hover:shadow-md' : 'shadow-none'} overflow-hidden transition-all duration-300 flex flex-col md:flex-row`}>
                        {/* Left Content Area */}
                        <div className="flex-1 p-5 space-y-3">
                           <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                               POST CODE: {post.postCode}
                             </span>
                           </div>
                           <h3 className="text-base font-black text-slate-900">{post.title}</h3>
                           <div className="flex flex-wrap items-center gap-4 text-[10px]">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                 <Building2 className="w-3.5 h-3.5" />
                                 <span className="font-bold uppercase tracking-tight">{post.departmentName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                 <DollarSign className="w-3.5 h-3.5" />
                                 <span className="font-bold">Pay Scale: {post.payScale}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                 <Users className="w-3.5 h-3.5" />
                                 <span className="font-bold">{post.vacanciesTotal} Vacancies</span>
                              </div>
                           </div>
                        </div>
                        {/* Right Sidebar Actions */}
                        <div className="w-full md:w-56 bg-slate-50/30 p-5 flex flex-col justify-center gap-2">
                           <button
                              onClick={() => {
                                setSelectedDriveId(drive.id);
                                setSelectedPostId(post.id);
                                setActiveTab('notice_detail');
                              }}
                              className="w-full py-2 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-xs"
                           >
                              <Info className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Notice</span>
                           </button>
                           <button
                              onClick={() => {
                                if (isLoggedIn) onApplyForPost(drive.id, post.id, post.title);
                                else onRequestLogin(post.title);
                              }}
                              className={`w-full py-2 rounded-xl ${theme.primaryButton} text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-sm transition active:scale-95`}
                           >
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply Now</span>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {activePdfModalDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${theme.cardBase} ${branding.showCardShadow ? '' : 'shadow-none'} w-full max-w-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between  pb-3">
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

            <div className={`p-6 bg-slate-50  ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} text-center space-y-4 max-h-[60vh] overflow-y-auto`}>
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
          <div className={`p-4 bg-white/50  ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} space-y-1`}>
             <span className="font-bold block">Online Account Creation</span>
             <p className="opacity-70 leading-snug text-[11px]">Applicants must register using their active email and mobile number.</p>
          </div>
          <div className={`p-4 bg-white/50  ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} space-y-1`}>
             <span className="font-bold block">Document Formats</span>
             <p className="opacity-70 leading-snug text-[11px]">Upload JPG/PNG photo (200KB) and signature (100KB). Certificates in PDF.</p>
          </div>
          <div className={`p-4 bg-white/50  ${branding.theme === 'industrial_heavy' ? 'rounded-none' : 'rounded-xl'} space-y-1`}>
             <span className="font-bold block">Payment & Exemption</span>
             <p className="opacity-70 leading-snug text-[11px]">Integrated gateway. SC/ST/PwD/Women are exempted from payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
