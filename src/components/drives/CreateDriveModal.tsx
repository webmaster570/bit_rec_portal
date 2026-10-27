import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { RecruitmentDrive } from '../../types';
import { X, Calendar, FileText, Building2, Plus, AlertCircle } from 'lucide-react';

interface CreateDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDriveModal: React.FC<CreateDriveModalProps> = ({ isOpen, onClose }) => {
  const { createDrive } = usePortal();

  const [formData, setFormData] = useState({
    driveCode: `RD-2026-UNIV-${Math.floor(10 + Math.random() * 90)}`,
    advtNumber: `ADV/2026/FAC-00${Math.floor(5 + Math.random() * 95)}`,
    title: 'Recruitment Drive 2026 — Faculty & Staff Recruitment',
    organization: 'National University of Technology & Sciences',
    description: 'Centralized recruitment for Teaching Faculty (Assistant Professor / Associate Professor) and Administrative Officers.',
    startDate: '2026-03-01',
    closingDate: '2026-04-30',
    correctionDate: '2026-05-05',
    feeDeadline: '2026-05-01',
    examDate: '2026-05-25',
    interviewPeriod: '2026-06-10 to 2026-06-25',
    resultDate: '2026-07-05',
    advtPdfName: 'Official_Advertisement_Notification_2026.pdf',
    notificationPdfName: 'Syllabus_Rules_Instructions.pdf',
    syllabusContent: '',
    showCategoryRow: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDrive({
      ...formData,
      status: 'applications_open',
      posts: [
        {
          id: `post-${Date.now()}`,
          postCode: 'AP-CSE-01',
          title: 'Assistant Professor (Computer Science)',
          departmentId: 'dept-01',
          departmentName: 'Computer Science & Engineering',
          payScale: 'Level 10 (₹57,700 - ₹1,82,400)',
          vacanciesTotal: 6,
          vacanciesBreakdown: { UR: 3, OBC: 1, SC: 1, ST: 0, EWS: 1, PwD: 0 },
          minAge: 21,
          maxAge: 38,
          minQualification: 'Ph.D. in CS/IT or First Class M.Tech in Computer Science',
          requiredExperienceYears: 2,
          applicationFee: 1000,
          feeExemptCategories: ['SC', 'ST', 'PwD'],
        },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Create New Recruitment Drive</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Drive Code / Reference
              </label>
              <input
                type="text"
                required
                value={formData.driveCode}
                onChange={(e) => setFormData({ ...formData, driveCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advertisement Number
              </label>
              <input
                type="text"
                required
                value={formData.advtNumber}
                onChange={(e) => setFormData({ ...formData, advtNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Notification Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recruitment Syllabus & Detailed Topics
            </label>
            <textarea
              rows={3}
              value={formData.syllabusContent}
              onChange={(e) => setFormData({ ...formData, syllabusContent: e.target.value })}
              placeholder="Enter detailed syllabus, topics, or exam pattern summary..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
            ></textarea>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">Show Category Vacancy Row</h4>
              <p className="text-[10px] text-slate-500">Enable/Disable visibility of category reservation breakdown (UR/OBC/etc) in public views.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.showCategoryRow}
                onChange={(e) => setFormData({ ...formData, showCategoryRow: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Dates Configuration Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Recruitment Lifecycle Important Dates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Closing Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Fee Deadline
                </label>
                <input
                  type="date"
                  required
                  value={formData.feeDeadline}
                  onChange={(e) => setFormData({ ...formData, feeDeadline: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Application Correction Window
                </label>
                <input
                  type="date"
                  value={formData.correctionDate}
                  onChange={(e) => setFormData({ ...formData, correctionDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Expected Exam Date
                </label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Result Declaration Date
                </label>
                <input
                  type="date"
                  value={formData.resultDate}
                  onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
            <p>
              Initial default post position (Assistant Professor - CS) will be created automatically. Additional posts can be configured anytime under the drive management portal.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white vibrant-btn-primary shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Drive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
