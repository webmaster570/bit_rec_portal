import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { RecruitmentDrive, PostConfig, DriveStatus } from '../../types';
import { THEME_CONFIGS } from '../../themeStyles';
import { CreateDriveModal } from './CreateDriveModal';
import { EditDriveModal } from './EditDriveModal';
import { DeleteDriveModal } from './DeleteDriveModal';
import { ConfigurePostModal } from './ConfigurePostModal';
import { EditPostModal } from './EditPostModal';
import {
  Megaphone,
  Plus,
  Calendar,
  FileText,
  Download,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Layers,
  LayoutList,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  Clock,
  Briefcase,
  AlertTriangle,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export const DriveManagement: React.FC = () => {
  const { drives, updateDrive, deletePostFromDrive, branding } = usePortal();
  const theme = THEME_CONFIGS[branding.theme || 'classic'];

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals & Active Drive States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState<RecruitmentDrive | null>(null);
  const [deletingDrive, setDeletingDrive] = useState<RecruitmentDrive | null>(null);
  const [selectedDriveForPost, setSelectedDriveForPost] = useState<string | null>(null);
  const [editingPostData, setEditingPostData] = useState<{ driveId: string; post: PostConfig } | null>(null);
  const [deletingPostData, setDeletingPostData] = useState<{ driveId: string; postId: string; postTitle: string } | null>(null);
  const [expandedDriveId, setExpandedDriveId] = useState<string | null>('drive-2026-01');
  const [previewPdfModal, setPreviewPdfModal] = useState<{ title: string; filename: string; syllabus?: string } | null>(null);

  // Quick stats
  const totalDrives = drives.length;
  const activeDrives = drives.filter(
    (d) => d.status === 'applications_open' || d.status === 'published' || d.status === 'screening_in_progress'
  ).length;
  const totalPositions = drives.reduce((acc, d) => acc + d.posts.length, 0);
  const totalVacancies = drives.reduce(
    (acc, d) => acc + d.posts.reduce((pAcc, p) => pAcc + p.vacanciesTotal, 0),
    0
  );
  const totalApplications = drives.reduce((acc, d) => acc + (d.totalApplicationsCount || 0), 0);

  // Filter logic
  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.advtNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driveCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.posts.some((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DriveStatus) => {
    switch (status) {
      case 'applications_open':
        return {
          label: 'Applications Open',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'screening_in_progress':
        return {
          label: 'Screening Active',
          bg: 'bg-blue-50 text-blue-700 border-blue-300',
          dot: 'bg-blue-500',
        };
      case 'interview_phase':
        return {
          label: 'Interview Phase',
          bg: 'bg-purple-50 text-purple-700 border-purple-300',
          dot: 'bg-purple-500',
        };
      case 'published':
        return {
          label: 'Published',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-300',
          dot: 'bg-indigo-500',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-teal-50 text-teal-700 border-teal-300',
          dot: 'bg-teal-500',
        };
      case 'draft':
        return {
          label: 'Draft',
          bg: 'bg-amber-50 text-amber-700 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'archived':
      default:
        return {
          label: 'Archived',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  const handleStatusChange = (driveId: string, newStatus: DriveStatus) => {
    updateDrive(driveId, { status: newStatus });
  };

  const confirmDeletePost = () => {
    if (deletingPostData) {
      deletePostFromDrive(deletingPostData.driveId, deletingPostData.postId);
      setDeletingPostData(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Module Title Bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${theme.cardBase} p-5 sm:p-6 shadow-md`}>
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Recruitment Drive Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized recruitment master control: configure drives, post quotas, timelines, eligibility, and lifecycle status.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tabular View"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Table View</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Card View</span>
            </button>
          </div>

          {/* New Recruitment Drive Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className={`px-4 py-2 ${theme.primaryButton} font-bold text-xs flex items-center space-x-2`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Drive</span>
          </button>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Total Drives</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900">{totalDrives}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Active Drives</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700">{activeDrives}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Total Positions</span>
            <span className="text-lg sm:text-xl font-extrabold text-purple-700">{totalPositions}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Sanctioned Vacancies</span>
            <span className="text-lg sm:text-xl font-extrabold text-pink-700">{totalVacancies}</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Applications Logged</span>
            <span className="text-lg sm:text-xl font-extrabold text-blue-700">{totalApplications}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl shadow-2xs border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Title, Advt No, Drive Code, Position, or Dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'applications_open', label: 'Open' },
            { id: 'screening_in_progress', label: 'Screening' },
            { id: 'interview_phase', label: 'Interview' },
            { id: 'published', label: 'Published' },
            { id: 'completed', label: 'Completed' },
            { id: 'draft', label: 'Draft' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABULAR RECRUITMENT DRIVES VIEW (Default primary layout) */}
      {viewMode === 'table' ? (
        <div className="glass-card rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Drive & Advertisement</th>
                  <th className="py-3.5 px-4">Lifecycle Status</th>
                  <th className="py-3.5 px-4">Key Timeline Schedule</th>
                  <th className="py-3.5 px-4 text-center">Positions / Vacancies</th>
                  <th className="py-3.5 px-4 text-center">Applications</th>
                  <th className="py-3.5 px-4 text-right">Management Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs bg-white">
                {filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No recruitment drives matched your search criteria.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try clearing the search filter or create a new drive.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drive, idx) => {
                    const isExpanded = expandedDriveId === drive.id;
                    const statusObj = getStatusBadge(drive.status);
                    const totalVac = drive.posts.reduce((acc, p) => acc + p.vacanciesTotal, 0);

                    return (
                      <React.Fragment key={drive.id}>
                        <tr
                          className={`hover:bg-indigo-50/40 transition-colors ${
                            isExpanded ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          {/* Row Number & Expand Trigger */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setExpandedDriveId(isExpanded ? null : drive.id)}
                              className="p-1 rounded-lg hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 transition"
                              title={isExpanded ? 'Collapse post details' : 'Expand post details'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-indigo-600 font-bold" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Drive & Advertisement Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                                  {drive.advtNumber}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  {drive.driveCode}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 text-sm">{drive.title}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {drive.organization}
                              </div>
                            </div>
                          </td>

                          {/* Lifecycle Status Pill + Quick Change Dropdown */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusObj.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`}></span>
                                {statusObj.label}
                              </span>

                              <select
                                value={drive.status}
                                onChange={(e) => handleStatusChange(drive.id, e.target.value as DriveStatus)}
                                className="block w-full text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
                                title="Quick change lifecycle status"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="applications_open">Applications Open</option>
                                <option value="screening_in_progress">Screening Active</option>
                                <option value="interview_phase">Interview Phase</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>
                          </td>

                          {/* Key Timeline Schedule */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center space-x-1 text-slate-700">
                                <span className="text-slate-400 font-medium">Start:</span>
                                <span className="font-semibold text-slate-900">{drive.startDate}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-rose-700">
                                <span className="text-slate-400 font-medium">Closing:</span>
                                <span className="font-bold">{drive.closingDate}</span>
                              </div>
                              {drive.examDate && (
                                <div className="text-[10px] text-indigo-700 font-mono">
                                  Exam: {drive.examDate}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Positions / Vacancies */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setExpandedDriveId(isExpanded ? null : drive.id)}
                              className="inline-flex flex-col items-center p-2 rounded-xl hover:bg-indigo-50 transition border border-transparent hover:border-indigo-200"
                            >
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                                {drive.posts.length} Positions
                              </span>
                              <span className="text-[11px] font-extrabold text-emerald-700 mt-1">
                                {totalVac} Total Vacancies
                              </span>
                            </button>
                          </td>

                          {/* Total Applications */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                              {drive.totalApplicationsCount || 0}
                            </span>
                          </td>

                          {/* Management Actions (Edit, Delete, Add Post, Advt PDF) */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Edit Drive Button */}
                              <button
                                onClick={() => setEditingDrive(drive)}
                                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition shadow-2xs"
                                title="Edit Recruitment Drive"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Drive Button */}
                              <button
                                onClick={() => setDeletingDrive(drive)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs"
                                title="Delete Recruitment Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Add Position Button */}
                              <button
                                onClick={() => setSelectedDriveForPost(drive.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-bold transition flex items-center space-x-1 shadow-2xs"
                                title="Add New Vacancy Position"
                              >
                                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Add Post</span>
                              </button>

                              {/* Advt PDF Viewer */}
                              <button
                                onClick={() =>
                                  setPreviewPdfModal({
                                    title: drive.title,
                                    filename: drive.notificationPdfName || 'Syllabus_Rules_Instructions.pdf',
                                    syllabus: drive.syllabusContent
                                  })
                                }
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs"
                                title="View Advertisement Notification PDF"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED SUB-TABLE: Configured Vacancy Positions */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-slate-50 border-b border-indigo-200">
                              <div className="p-4 sm:p-5 space-y-3 bg-gradient-to-b from-indigo-50/40 via-slate-50 to-slate-100/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                                  <div className="flex items-center space-x-2">
                                    <Layers className="w-4 h-4 text-indigo-600" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                                      Configured Vacancy Positions ({drive.posts.length}) for {drive.advtNumber}
                                    </h4>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                                      Category reservation matrix & pay levels applied
                                    </span>
                                    <button
                                      onClick={() => setSelectedDriveForPost(drive.id)}
                                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 shadow-2xs"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Configure Position</span>
                                    </button>
                                  </div>
                                </div>

                                {drive.posts.length === 0 ? (
                                  <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                                    No vacancy positions configured under this drive yet.
                                    <button
                                      onClick={() => setSelectedDriveForPost(drive.id)}
                                      className="block mx-auto mt-2 text-indigo-600 font-bold hover:underline"
                                    >
                                      + Add first position now
                                    </button>
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                                          <th className="py-2.5 px-3">Post Code</th>
                                          <th className="py-2.5 px-3">Post Title & Department</th>
                                          <th className="py-2.5 px-3">Pay Scale</th>
                                          <th className="py-2.5 px-3 text-center">Total Vacancies</th>
                                          {drive.showCategoryRow !== false && (
                                            <th className="py-2.5 px-3 text-center">Reservation Quota (UR/OBC/SC/ST/EWS/PwD)</th>
                                          )}
                                          <th className="py-2.5 px-3 text-center">Age Limit</th>
                                          <th className="py-2.5 px-3 text-center">Fee</th>
                                          <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {drive.posts.map((post) => (
                                          <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 text-[11px]">
                                              {post.postCode}
                                            </td>
                                            <td className="py-2.5 px-3">
                                              <div className="font-bold text-slate-900">{post.title}</div>
                                              <div className="text-[11px] text-indigo-600 font-medium">
                                                {post.departmentName}
                                              </div>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                                              {post.payScale}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                                                {post.vacanciesTotal}
                                              </span>
                                            </td>
                                            {drive.showCategoryRow !== false && (
                                              <td className="py-2.5 px-3 text-center">
                                                <div className="inline-flex items-center gap-1 font-mono text-[10px]">
                                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200" title="Unreserved">
                                                    UR:{post.vacanciesBreakdown.UR}
                                                  </span>
                                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200" title="Other Backward Classes">
                                                    OBC:{post.vacanciesBreakdown.OBC}
                                                  </span>
                                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200" title="Scheduled Castes">
                                                    SC:{post.vacanciesBreakdown.SC}
                                                  </span>
                                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200" title="Scheduled Tribes">
                                                    ST:{post.vacanciesBreakdown.ST}
                                                  </span>
                                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200" title="Economically Weaker Sections">
                                                    EWS:{post.vacanciesBreakdown.EWS}
                                                  </span>
                                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200" title="Persons with Benchmark Disabilities">
                                                    PwD:{post.vacanciesBreakdown.PwD}
                                                  </span>
                                                </div>
                                              </td>
                                            )}
                                            <td className="py-2.5 px-3 text-center text-[11px] text-slate-600 font-medium">
                                              {post.minAge}–{post.maxAge} Yrs
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-[11px] font-bold text-slate-800">
                                              ₹{post.applicationFee}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                              <div className="flex items-center justify-end space-x-1">
                                                <button
                                                  onClick={() => setEditingPostData({ driveId: drive.id, post })}
                                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                                                  title="Edit position"
                                                >
                                                  <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    setDeletingPostData({
                                                      driveId: drive.id,
                                                      postId: post.id,
                                                      postTitle: post.title,
                                                    })
                                                  }
                                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                                                  title="Delete position"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW (Alternative interactive visual cards) */
        <div className="space-y-4">
          {filteredDrives.map((drive) => {
            const isExpanded = expandedDriveId === drive.id;
            const statusObj = getStatusBadge(drive.status);
            const totalVac = drive.posts.reduce((acc, p) => acc + p.vacanciesTotal, 0);

            return (
              <div
                key={drive.id}
                className={`${theme.cardBase} overflow-hidden shadow-xs transition`}
              >
                {/* Drive Card Header */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded font-mono text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                        {drive.advtNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusObj.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`}></span>
                        {statusObj.label}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Code: <span className="font-mono text-slate-800 font-bold">{drive.driveCode}</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {drive.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {drive.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    {/* Edit Drive */}
                    <button
                      onClick={() => setEditingDrive(drive)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Drive */}
                    <button
                      onClick={() => setDeletingDrive(drive)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    {/* Add Position */}
                    <button
                      onClick={() => setSelectedDriveForPost(drive.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Add Post</span>
                    </button>

                    {/* Advt PDF */}
                    <button
                      onClick={() =>
                        setPreviewPdfModal({
                          title: drive.title,
                          filename: drive.notificationPdfName || 'Syllabus_Rules_Instructions.pdf',
                          syllabus: drive.syllabusContent
                        })
                      }
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition"
                      title="View PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    </button>

                    {/* Accordion Toggle */}
                    <button
                      onClick={() => setExpandedDriveId(isExpanded ? null : drive.id)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Timeline Info Bar */}
                <div className="bg-slate-50 px-5 py-3 border-t border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Start Date</span>
                    <span className="font-semibold text-slate-900">{drive.startDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Closing Date</span>
                    <span className="font-bold text-rose-700">{drive.closingDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Fee Deadline</span>
                    <span className="font-semibold text-slate-900">{drive.feeDeadline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Exam Date</span>
                    <span className="font-semibold text-slate-900">{drive.examDate || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Interview Window</span>
                    <span className="font-semibold text-slate-900">{drive.interviewPeriod || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Applications</span>
                    <span className="font-bold text-indigo-700">{drive.totalApplicationsCount || 0}</span>
                  </div>
                </div>

                {/* Expanded Positions Breakdown */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Configured Positions / Posts ({drive.posts.length})
                      </h4>
                      <button
                        onClick={() => setSelectedDriveForPost(drive.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Position</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {drive.posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition shadow-2xs relative"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                                {post.postCode}
                              </span>
                              <h5 className="text-sm font-bold text-slate-900 mt-1">{post.title}</h5>
                              <span className="text-xs text-indigo-600 font-medium">
                                Dept: {post.departmentName}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold">
                                {post.vacanciesTotal} Vacancies
                              </span>
                              <button
                                onClick={() => setEditingPostData({ driveId: drive.id, post })}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                                title="Edit post"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeletingPostData({
                                    driveId: drive.id,
                                    postId: post.id,
                                    postTitle: post.title,
                                  })
                                }
                                className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                                title="Delete post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Reservation Quotas */}
                          {drive.showCategoryRow !== false && (
                            <div className="mt-3 grid grid-cols-6 gap-1 text-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                              <div>
                                <span className="block text-[9px] text-slate-500 font-bold">UR</span>
                                <span className="font-semibold text-slate-800">{post.vacanciesBreakdown.UR}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-500 font-bold">OBC</span>
                                <span className="font-semibold text-slate-800">{post.vacanciesBreakdown.OBC}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-500 font-bold">SC</span>
                                <span className="font-semibold text-slate-800">{post.vacanciesBreakdown.SC}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-500 font-bold">ST</span>
                                <span className="font-semibold text-slate-800">{post.vacanciesBreakdown.ST}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-500 font-bold">EWS</span>
                                <span className="font-semibold text-slate-800">{post.vacanciesBreakdown.EWS}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-500 font-bold">PwD</span>
                                <span className="font-semibold text-slate-800">{post.vacanciesBreakdown.PwD}</span>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 text-[11px] text-slate-700 space-y-1">
                            <p>
                              <span className="text-slate-500 font-medium">Pay Scale:</span> {post.payScale}
                            </p>
                            <p>
                              <span className="text-slate-500 font-medium">Age Limit:</span> {post.minAge} – {post.maxAge} Years
                            </p>
                            <p>
                              <span className="text-slate-500 font-medium">Fee:</span> ₹{post.applicationFee}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DRIVE MODAL */}
      <CreateDriveModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* EDIT DRIVE MODAL */}
      {editingDrive && (
        <EditDriveModal
          isOpen={true}
          drive={editingDrive}
          onClose={() => setEditingDrive(null)}
        />
      )}

      {/* DELETE DRIVE MODAL */}
      {deletingDrive && (
        <DeleteDriveModal
          isOpen={true}
          drive={deletingDrive}
          onClose={() => setDeletingDrive(null)}
        />
      )}

      {/* CONFIGURE NEW POST MODAL */}
      {selectedDriveForPost && (
        <ConfigurePostModal
          isOpen={true}
          driveId={selectedDriveForPost}
          onClose={() => setSelectedDriveForPost(null)}
        />
      )}

      {/* EDIT POST MODAL */}
      {editingPostData && (
        <EditPostModal
          isOpen={true}
          driveId={editingPostData.driveId}
          post={editingPostData.post}
          onClose={() => setEditingPostData(null)}
        />
      )}

      {/* DELETE POST CONFIRMATION DIALOG */}
      {deletingPostData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Vacancy Position</h3>
                <p className="text-xs text-slate-500">Confirm position removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 font-bold">"{deletingPostData.postTitle}"</strong> from this recruitment drive?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostData(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePost}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Delete Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Notification Viewer Modal */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">{previewPdfModal.filename}</h3>
              </div>
              <button
                onClick={() => setPreviewPdfModal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4 max-h-[60vh] overflow-y-auto">
              <Building2 className="w-12 h-12 text-indigo-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">{previewPdfModal.title}</h4>
              
              {previewPdfModal.syllabus ? (
                <div className="text-left bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h5 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Detailed Syllabus & Exam Pattern
                  </h5>
                  <div className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    {previewPdfModal.syllabus}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Official Government & University Recruitment Notification Document. Contains detailed rules, eligibility matrices, reservation policies, and syllabus details.
                </p>
              )}
              
              <div className="inline-flex items-center gap-2 px-5 py-2.5 vibrant-btn-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Download Official Notification PDF</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
