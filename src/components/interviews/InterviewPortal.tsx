import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application } from '../../types';
import {
  Award,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Building2,
  FileText,
  Plus,
  Star,
  Send,
  Sliders,
} from 'lucide-react';

export const InterviewPortal: React.FC = () => {
  const { applications, scheduleExamAndInterview, submitInterviewScore } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(
    applications.find((a) => a.stage === 'interview_scheduled' || a.stage === 'doc_verified' || a.stage === 'interviewed') || applications[0] || null
  );

  // Evaluation Form State
  const [evaluatorName, setEvaluatorName] = useState('Prof. S. R. Ramanathan');
  const [writtenTestScore, setWrittenTestScore] = useState<number>(85);
  const [academicScore, setAcademicScore] = useState<number>(18);
  const [interviewScore, setInterviewScore] = useState<number>(44);
  const [teachingDemoScore, setTeachingDemoScore] = useState<number>(26);
  const [comments, setComments] = useState(
    'Strong analytical foundation, clear presentation during teaching demo, answered domain queries confidently.'
  );
  const [recommendation, setRecommendation] = useState<
    'Strongly Recommend' | 'Recommend' | 'Marginal' | 'Not Recommended'
  >('Strongly Recommend');

  // Scheduling State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [examCenter, setExamCenter] = useState('Main Campus Examination Hall A');
  const [examDateTime, setExamDateTime] = useState('2026-04-20 10:00 AM');
  const [interviewVenue, setInterviewVenue] = useState('Conference Room B, NUTS Campus');
  const [interviewDateTime, setInterviewDateTime] = useState('2026-05-15 11:30 AM');

  const filteredApps = applications.filter((app) =>
    app.applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.postTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    submitInterviewScore(selectedApp.id, {
      panelMemberId: `panel-${Date.now()}`,
      panelMemberName: evaluatorName,
      writtenTestScore,
      academicScore,
      interviewScore,
      teachingDemoScore,
      comments,
      recommendation,
    });

    alert(`Evaluation scores submitted successfully for ${selectedApp.applicant.fullName}!`);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const rollNo = `ROLL-${selectedApp.postTitle.slice(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;

    scheduleExamAndInterview(
      selectedApp.id,
      { center: examCenter, dateTime: examDateTime, rollNo },
      { venue: interviewVenue, dateTime: interviewDateTime }
    );

    setShowScheduleModal(false);
    alert(`Test & Interview successfully scheduled! Roll No ${rollNo} generated.`);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl shadow-md border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Test & Interview Evaluation Panel</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Schedule written tests/interviews, record rubric marks, and enter panel member recommendation feedback.
          </p>
        </div>

        {selectedApp && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs transition flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Test & Hall Ticket</span>
          </button>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Candidate List Column */}
        <div className="lg:col-span-4 glass-card border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto space-y-1">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-rose-50 border border-rose-300 text-slate-900'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block">{app.applicant.fullName}</span>
                    <span className="text-[10px] text-indigo-600 font-semibold block">{app.postTitle}</span>
                    {app.rollNumber && (
                      <span className="text-[10px] font-mono text-emerald-600 block">Roll: {app.rollNumber}</span>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {app.aggregateScore ? `${app.aggregateScore} Pts` : 'Scheduled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evaluation Rubrics Panel */}
        <div className="lg:col-span-8 glass-card border border-slate-200 rounded-2xl p-6 shadow-2xs">
          {selectedApp ? (
            <form onSubmit={handleSubmitEvaluation} className="space-y-5">
              {/* Candidate Banner */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedApp.applicant.photoUrl}
                    alt={selectedApp.applicant.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-500"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedApp.applicant.fullName}</h3>
                    <p className="text-xs text-rose-700 font-semibold">{selectedApp.postTitle}</p>
                    <span className="text-[10px] text-slate-500">
                      Roll No: <strong className="text-emerald-700 font-mono">{selectedApp.rollNumber || 'Not Generated'}</strong> | Category: {selectedApp.applicant.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Current Score</span>
                  <span className="text-xl font-extrabold text-amber-600">
                    {selectedApp.aggregateScore || '0.0'} / 100
                  </span>
                </div>
              </div>

              {/* Score Input Rubrics Grid */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Evaluation Rubrics & Marks Distribution
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Written Test Marks (Max 100)
                    </label>
                    <input
                      type="number"
                      max={100}
                      value={writtenTestScore}
                      onChange={(e) => setWrittenTestScore(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-sm text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Academic Index (Max 20)
                    </label>
                    <input
                      type="number"
                      max={20}
                      value={academicScore}
                      onChange={(e) => setAcademicScore(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-sm text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Interview Performance (Max 50)
                    </label>
                    <input
                      type="number"
                      max={50}
                      value={interviewScore}
                      onChange={(e) => setInterviewScore(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-sm text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Teaching/Tech Demo (Max 30)
                    </label>
                    <input
                      type="number"
                      max={30}
                      value={teachingDemoScore}
                      onChange={(e) => setTeachingDemoScore(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-bold text-sm text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Comments & Recommendation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Panel Comments & Final Recommendation
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Evaluator Feedback & Qualitative Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Panel Recommendation</label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none"
                    >
                      <option value="Strongly Recommend">Strongly Recommend</option>
                      <option value="Recommend">Recommend</option>
                      <option value="Marginal">Marginal</option>
                      <option value="Not Recommended">Not Recommended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Panel Member Name</label>
                    <input
                      type="text"
                      value={evaluatorName}
                      onChange={(e) => setEvaluatorName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Evaluation Scores</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a candidate from the left panel to begin test/interview scoring.
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Schedule Written Test & Interview for {selectedApp.applicant.fullName}
            </h3>

            <form onSubmit={handleConfirmSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Center Venue</label>
                <input
                  type="text"
                  required
                  value={examCenter}
                  onChange={(e) => setExamCenter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Date & Time</label>
                <input
                  type="text"
                  required
                  value={examDateTime}
                  onChange={(e) => setExamDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Venue</label>
                <input
                  type="text"
                  value={interviewVenue}
                  onChange={(e) => setInterviewVenue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Date & Time</label>
                <input
                  type="text"
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Generate Hall Ticket & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
