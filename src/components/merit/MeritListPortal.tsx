import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { OfferLetterModal } from '../common/OfferLetterModal';
import { Application } from '../../types';
import {
  Trophy,
  Award,
  Sliders,
  Send,
  CheckCircle2,
  FileText,
  User,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const MeritListPortal: React.FC = () => {
  const {
    drives,
    applications,
    generateMeritList,
    publishOfferLetter,
    weightageConfig,
    setWeightageConfig,
  } = usePortal();

  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[0]?.id || 'drive-2026-01');
  const [selectedPostId, setSelectedPostId] = useState<string>(
    drives[0]?.posts[0]?.id || 'post-101'
  );

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showOfferModalApp, setShowOfferModalApp] = useState<Application | null>(null);

  const activeDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];
  const activePost = activeDrive?.posts.find((p) => p.id === selectedPostId) || activeDrive?.posts[0];

  // Candidates for this post
  const postApps = applications.filter(
    (app) => app.driveId === selectedDriveId && app.postId === selectedPostId
  );

  const filteredMeritApps = postApps.filter(
    (a) => selectedCategoryFilter === 'all' || a.applicant.category === selectedCategoryFilter
  );

  const handleRunMeritEngine = () => {
    generateMeritList(selectedDriveId, selectedPostId, weightageConfig);
    alert('Automated Merit List generated successfully! Category ranks & selection quotas assigned.');
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Merit Engine & Offer Generator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated rank calculator using weighted composite scores, category reservation quotas, and tie-breaker rules.
          </p>
        </div>

        <button
          onClick={handleRunMeritEngine}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Recalculate & Publish Merit List</span>
        </button>
      </div>

      {/* Drive and Post Selection + Formula Weights Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drive Selector */}
        <div className="lg:col-span-5 glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Select Target Position for Merit List
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recruitment Drive</label>
            <select
              value={selectedDriveId}
              onChange={(e) => {
                setSelectedDriveId(e.target.value);
                const d = drives.find((dr) => dr.id === e.target.value);
                if (d && d.posts[0]) setSelectedPostId(d.posts[0].id);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Post</label>
            <select
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
            >
              {activeDrive?.posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.vacanciesTotal} Vacancies)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Reservation Vacancy Matrix</span>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                UR: <strong>{activePost?.vacanciesBreakdown.UR}</strong>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                OBC: <strong>{activePost?.vacanciesBreakdown.OBC}</strong>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                SC: <strong>{activePost?.vacanciesBreakdown.SC}</strong>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                ST: <strong>{activePost?.vacanciesBreakdown.ST}</strong>
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                EWS: <strong>{activePost?.vacanciesBreakdown.EWS}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Formula Weightage Configuration */}
        <div className="lg:col-span-7 glass-card border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            Weighted Score Formula & Tie-Breaker Rule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Written Test Weight (%)
              </label>
              <input
                type="number"
                value={weightageConfig.writtenTestWeight}
                onChange={(e) =>
                  setWeightageConfig({ ...weightageConfig, writtenTestWeight: Number(e.target.value) })
                }
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Interview Weight (%)
              </label>
              <input
                type="number"
                value={weightageConfig.interviewWeight}
                onChange={(e) =>
                  setWeightageConfig({ ...weightageConfig, interviewWeight: Number(e.target.value) })
                }
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academic Weight (%)
              </label>
              <input
                type="number"
                value={weightageConfig.academicWeight}
                onChange={(e) =>
                  setWeightageConfig({ ...weightageConfig, academicWeight: Number(e.target.value) })
                }
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Automated Tie-Breaker Priority Rule
            </label>
            <select
              value={weightageConfig.tieBreakerRule}
              onChange={(e) => setWeightageConfig({ ...weightageConfig, tieBreakerRule: e.target.value as any })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="Age">Older Candidate Ranked Higher (Date of Birth)</option>
              <option value="AcademicScore">Higher Academic Degree CGPA First</option>
              <option value="WrittenScore">Higher Written Examination Score First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Published Merit & Selection Table */}
      <div className="glass-card border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-600" />
            Ranked Merit List — {activePost?.title}
          </h3>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">All Category Candidates</option>
              <option value="UR">UR Category Ranks</option>
              <option value="OBC">OBC Category Ranks</option>
              <option value="SC">SC Category Ranks</option>
              <option value="ST">ST Category Ranks</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Merit Rank</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Category / DOB</th>
                <th className="p-3">Composite Score</th>
                <th className="p-3">Selection Category</th>
                <th className="p-3">Offer Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMeritApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No candidates evaluated for this position yet.
                  </td>
                </tr>
              ) : (
                filteredMeritApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono">
                      {app.meritRank ? (
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-bold flex items-center justify-center">
                          #{app.meritRank}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{app.applicant.fullName}</span>
                      <span className="text-[10px] text-slate-500">{app.applicationNo}</span>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold text-slate-800 block">{app.applicant.category}</span>
                      <span className="text-[10px] text-slate-500 block">{app.applicant.dob}</span>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-amber-700 text-sm">
                        {app.aggregateScore || '0.0'} / 100
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {app.selectionCategory || app.applicant.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.selectedStatus === 'Selected'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.selectedStatus === 'Waitlisted'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.selectedStatus || 'Pending'}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => publishOfferLetter(app.id)}
                        className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-semibold border border-purple-200 inline-flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Issue Offer</span>
                      </button>

                      <button
                        onClick={() => setShowOfferModalApp(app)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Preview Letter</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showOfferModalApp && (
        <OfferLetterModal application={showOfferModalApp} onClose={() => setShowOfferModalApp(null)} />
      )}
    </div>
  );
};
