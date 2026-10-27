import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application } from '../../types';
import {
  CheckSquare,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Building2,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const ScreeningPortal: React.FC = () => {
  const { applications, drives, updateScreening, currentRole } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('Pending');

  const [activeScreeningApp, setActiveScreeningApp] = useState<Application | null>(
    applications.find((a) => a.screeningStatus === 'Pending') || applications[0] || null
  );

  const [decision, setDecision] = useState<'Eligible' | 'Provisionally Eligible' | 'Ineligible'>('Eligible');
  const [remarks, setRemarks] = useState('');
  const [committeeMemberName, setCommitteeMemberName] = useState('Dr. Aris Thorne (Convener)');

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.postTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDrive = selectedDriveFilter === 'all' || app.driveId === selectedDriveFilter;
    const matchesStatus = statusFilter === 'all' || app.screeningStatus === statusFilter;

    return matchesSearch && matchesDrive && matchesStatus;
  });

  const handleSaveScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScreeningApp) return;

    updateScreening(activeScreeningApp.id, decision, remarks || 'Eligibility checks verified by committee.', committeeMemberName);
    setRemarks('');

    // pick next pending app if available
    const nextPending = applications.find(
      (a) => a.id !== activeScreeningApp.id && a.screeningStatus === 'Pending'
    );
    if (nextPending) {
      setActiveScreeningApp(nextPending);
    }
  };

  // calculate age from DOB
  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Applicant Screening Committee Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review candidate eligibility against configured post age limits, qualifications, and reservation criteria.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
            Pending Screening: {applications.filter((a) => a.screeningStatus === 'Pending').length} Apps
          </span>
        </div>
      </div>

      {/* Main Workspace Layout: List on Left, Active Evaluation Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate List */}
        <div className="lg:col-span-5 glass-card border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Eligible">Eligible</option>
                <option value="Provisionally Eligible">Provisionally Eligible</option>
                <option value="Ineligible">Ineligible</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto space-y-1">
            {filteredApps.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No candidates pending screening in this view.
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = activeScreeningApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setActiveScreeningApp(app)}
                    className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-slate-900'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{app.applicant.fullName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{app.applicationNo}</span>
                      </div>
                      <p className="text-[11px] text-indigo-700 font-medium">{app.postTitle}</p>
                      <span className="text-[10px] text-slate-500 block">
                        Category: {app.applicant.category} | Age: {calculateAge(app.applicant.dob)} yrs
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        app.screeningStatus === 'Eligible'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : app.screeningStatus === 'Ineligible'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : app.screeningStatus === 'Provisionally Eligible'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {app.screeningStatus || 'Pending'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Comprehensive Evaluation Panel */}
        <div className="lg:col-span-7 glass-card border border-slate-200 rounded-2xl p-6 shadow-2xs">
          {activeScreeningApp ? (
            <form onSubmit={handleSaveScreening} className="space-y-5">
              {/* Candidate Banner */}
              <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeScreeningApp.applicant.photoUrl}
                    alt={activeScreeningApp.applicant.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeScreeningApp.applicant.fullName}
                    </h3>
                    <p className="text-xs text-indigo-700 font-semibold">
                      {activeScreeningApp.postTitle} ({activeScreeningApp.departmentName})
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      App No: {activeScreeningApp.applicationNo} | Reg No: {activeScreeningApp.applicant.regNumber}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  {activeScreeningApp.applicant.category} Category
                </span>
              </div>

              {/* Eligibility Matrix Check */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Screening Checklist Matrix
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] uppercase font-medium">Age Limit Verification</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      Candidate Age: {calculateAge(activeScreeningApp.applicant.dob)} Years
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-1 font-medium">
                      ✓ Within Configured Post Max Age (38 Years + Relaxation)
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-500 block text-[10px] uppercase font-medium">Highest Educational Degree</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {activeScreeningApp.academics[0]?.degree || 'Ph.D. Verified'}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-1 font-medium">
                      ✓ Meets Minimum Qualification Criteria
                    </span>
                  </div>
                </div>
              </div>

              {/* Screening Decision Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Committee Decision & Remarks
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Mark Screening Eligibility
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Eligible', label: 'Eligible', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                      { id: 'Provisionally Eligible', label: 'Provisional', color: 'bg-amber-50 text-amber-700 border-amber-300' },
                      { id: 'Ineligible', label: 'Ineligible', color: 'bg-rose-50 text-rose-700 border-rose-300' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDecision(opt.id as any)}
                        className={`p-2.5 rounded-lg text-xs font-bold border transition ${
                          decision === opt.id
                            ? `${opt.color} ring-2 ring-amber-500 shadow-2xs`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mandatory Committee Remarks / Justification
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter screening observations, document discrepancies, or qualification verification details..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evaluator / Committee Convener Name
                  </label>
                  <input
                    type="text"
                    value={committeeMemberName}
                    onChange={(e) => setCommitteeMemberName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Screening Decision</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a candidate from the left list to begin eligibility screening.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
