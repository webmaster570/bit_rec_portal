import React from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  FileText,
  Building2,
} from 'lucide-react';

export const AnalyticsPortal: React.FC = () => {
  const { applications, drives } = usePortal();

  // Metrics calculation
  const totalApps = applications.length;
  const eligibleApps = applications.filter((a) => a.screeningStatus === 'Eligible').length;
  const docVerifiedApps = applications.filter((a) => a.docVerificationStatus === 'Verified').length;
  const selectedApps = applications.filter((a) => a.selectedStatus === 'Selected').length;

  const categoryCounts = {
    UR: applications.filter((a) => a.applicant.category === 'UR').length,
    OBC: applications.filter((a) => a.applicant.category === 'OBC').length,
    SC: applications.filter((a) => a.applicant.category === 'SC').length,
    ST: applications.filter((a) => a.applicant.category === 'ST').length,
    EWS: applications.filter((a) => a.applicant.category === 'EWS').length,
  };

  const genderCounts = {
    Male: applications.filter((a) => a.applicant.gender === 'Male').length,
    Female: applications.filter((a) => a.applicant.gender === 'Female').length,
    Other: applications.filter((a) => a.applicant.gender === 'Other').length,
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="glass-card border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Recruitment Analytics & Funnel Reports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data insights, reservation category breakdown, recruitment funnel conversion rates, and department metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            Live Database Telemetry
          </span>
        </div>
      </div>

      {/* Recruitment Funnel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 uppercase font-medium">1. Total Applications Received</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalApps}</div>
          <p className="text-[10px] text-indigo-600 font-medium">Across all active recruitment drives</p>
        </div>

        <div className="glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 uppercase font-medium">2. Screened Eligible</span>
          <div className="text-2xl font-extrabold text-amber-600">{eligibleApps}</div>
          <p className="text-[10px] text-amber-700 font-medium">
            {totalApps ? Math.round((eligibleApps / totalApps) * 100) : 0}% Qualification Pass Rate
          </p>
        </div>

        <div className="glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 uppercase font-medium">3. Document Verified</span>
          <div className="text-2xl font-extrabold text-cyan-600">{docVerifiedApps}</div>
          <p className="text-[10px] text-cyan-700 font-medium">Clear Transcripts & Certificates</p>
        </div>

        <div className="glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 uppercase font-medium">4. Offers / Selected</span>
          <div className="text-2xl font-extrabold text-emerald-600">{selectedApps}</div>
          <p className="text-[10px] text-emerald-700 font-medium">Appointment Letters Issued</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reservation Category Bar Visualization */}
        <div className="lg:col-span-7 glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
            Category Reservation Distribution (Social Quota Breakdown)
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const percentage = totalApps ? Math.round((count / totalApps) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-900">{cat} Category</span>
                    <span className="text-indigo-600">
                      {count} Applicants ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender Diversity Metrics */}
        <div className="lg:col-span-5 glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Gender Diversity Metrics
          </h3>

          <div className="space-y-4 pt-2">
            {Object.entries(genderCounts).map(([gender, count]) => {
              const percentage = totalApps ? Math.round((count / totalApps) * 100) : 0;
              return (
                <div key={gender} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{gender} Candidates</span>
                    <span className="text-[10px] text-slate-500">{count} Registered Applications</span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
