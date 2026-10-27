import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { RecruitmentDrive, DriveStatus } from '../../types';
import { X, Calendar, FileText, Building2, Save, AlertCircle, Sparkles, Layers, Users } from 'lucide-react';

interface EditDriveModalProps {
  isOpen: boolean;
  drive: RecruitmentDrive | null;
  onClose: () => void;
}

export const EditDriveModal: React.FC<EditDriveModalProps> = ({ isOpen, drive, onClose }) => {
  const { updateDrive } = usePortal();

  const [formData, setFormData] = useState({
    driveCode: '',
    advtNumber: '',
    title: '',
    organization: '',
    description: '',
    status: 'applications_open' as DriveStatus,
    startDate: '',
    closingDate: '',
    correctionDate: '',
    feeDeadline: '',
    examDate: '',
    interviewPeriod: '',
    resultDate: '',
    advtPdfName: '',
    notificationPdfName: '',
    syllabusContent: '',
    showCategoryRow: true,
  });

  useEffect(() => {
    if (drive) {
      setFormData({
        driveCode: drive.driveCode || '',
        advtNumber: drive.advtNumber || '',
        title: drive.title || '',
        organization: drive.organization || '',
        description: drive.description || '',
        status: drive.status || 'applications_open',
        startDate: drive.startDate || '',
        closingDate: drive.closingDate || '',
        correctionDate: drive.correctionDate || '',
        feeDeadline: drive.feeDeadline || '',
        examDate: drive.examDate || '',
        interviewPeriod: drive.interviewPeriod || '',
        resultDate: drive.resultDate || '',
        advtPdfName: drive.advtPdfName || 'Official_Advertisement_Notification_2026.pdf',
        notificationPdfName: drive.notificationPdfName || 'Syllabus_Rules_Instructions.pdf',
        syllabusContent: drive.syllabusContent || '',
        showCategoryRow: drive.showCategoryRow !== undefined ? drive.showCategoryRow : true,
      });
    }
  }, [drive]);

  if (!isOpen || !drive) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDrive(drive.id, {
      ...formData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Edit Recruitment Drive</h3>
              <p className="text-xs text-slate-500">
                Updating <span className="font-mono font-bold text-indigo-700">{drive.driveCode}</span> • Advt: {drive.advtNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Quick Metrics Header */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Configured Posts</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                {drive.posts.length} Vacancy Positions
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Vacancies</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">
                {drive.posts.reduce((acc, p) => acc + p.vacanciesTotal, 0)} Seats
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Applications Logged</span>
              <span className="font-bold text-purple-700 flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                {drive.totalApplicationsCount || 0} Submissions
              </span>
            </div>
          </div>

          {/* Core Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Drive Code / Reference
              </label>
              <input
                type="text"
                required
                value={formData.driveCode}
                onChange={(e) => setFormData({ ...formData, driveCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Advertisement Number
              </label>
              <input
                type="text"
                required
                value={formData.advtNumber}
                onChange={(e) => setFormData({ ...formData, advtNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Drive Lifecycle Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DriveStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="draft">Draft (Unpublished)</option>
                <option value="published">Published (Announced)</option>
                <option value="applications_open">Applications Open (Active)</option>
                <option value="screening_in_progress">Screening In Progress</option>
                <option value="interview_phase">Interview Phase</option>
                <option value="completed">Completed / Merit Issued</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Drive Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Organization / Institution Name
            </label>
            <input
              type="text"
              required
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Drive Description & Eligibility Summary
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed"
            ></textarea>
          </div>

          {/* Critical Timeline Dates */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Recruitment Timeline & Schedule Windows</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Application Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Application Closing Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Fee Payment Deadline
                </label>
                <input
                  type="date"
                  required
                  value={formData.feeDeadline}
                  onChange={(e) => setFormData({ ...formData, feeDeadline: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Correction Window Date
                </label>
                <input
                  type="date"
                  value={formData.correctionDate}
                  onChange={(e) => setFormData({ ...formData, correctionDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tentative Written Exam Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-05-25"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Interview Window
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-06-10 to 2026-06-25"
                  value={formData.interviewPeriod}
                  onChange={(e) => setFormData({ ...formData, interviewPeriod: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* PDF Document File Labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Advertisement PDF Filename
              </label>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <input
                  type="text"
                  value={formData.advtPdfName}
                  onChange={(e) => setFormData({ ...formData, advtPdfName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Syllabus & Rules PDF Filename
              </label>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <input
                  type="text"
                  value={formData.notificationPdfName}
                  onChange={(e) => setFormData({ ...formData, notificationPdfName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recruitment Syllabus & Detailed Topics
            </label>
            <textarea
              rows={4}
              value={formData.syllabusContent}
              onChange={(e) => setFormData({ ...formData, syllabusContent: e.target.value })}
              placeholder="Enter detailed syllabus, exam pattern, or topics for this recruitment drive..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            ></textarea>
          </div>

          <div className="flex items-center space-x-3 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">Show Category Vacancy Row</h4>
              <p className="text-[10px] text-slate-500">Toggle visibility of UR, OBC, SC, ST, EWS, PwD reservation breakdown in public views.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.showCategoryRow}
                onChange={(e) => setFormData({ ...formData, showCategoryRow: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Drive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
