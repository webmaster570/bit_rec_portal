import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { RecruitmentDrive } from '../../types';
import { AlertTriangle, Trash2, X, FileText, Layers, Users } from 'lucide-react';

interface DeleteDriveModalProps {
  isOpen: boolean;
  drive: RecruitmentDrive | null;
  onClose: () => void;
}

export const DeleteDriveModal: React.FC<DeleteDriveModalProps> = ({ isOpen, drive, onClose }) => {
  const { deleteDrive } = usePortal();

  if (!isOpen || !drive) return null;

  const handleDelete = () => {
    deleteDrive(drive.id);
    onClose();
  };

  const totalVacancies = drive.posts.reduce((acc, p) => acc + p.vacanciesTotal, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-rose-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-rose-100 bg-rose-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">Confirm Drive Deletion</h3>
              <p className="text-xs text-rose-700">Irreversible Recruitment Database Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-700 leading-relaxed">
            Are you sure you want to permanently delete the recruitment drive{' '}
            <strong className="text-slate-950 font-bold">"{drive.title}"</strong>?
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Drive Reference Code:</span>
              <span className="font-mono font-bold text-indigo-700">{drive.driveCode}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Advertisement No:</span>
              <span className="font-mono font-bold text-slate-900">{drive.advtNumber}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Configured Posts:</span>
              <span className="font-semibold text-slate-800">{drive.posts.length} Posts ({totalVacancies} Vacancies)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Associated Applications:</span>
              <span className="font-bold text-purple-700">{drive.totalApplicationsCount || 0} Applications</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-snug">
            ⚠️ <span className="font-semibold">Notice:</span> Deleting this drive will remove it from the active database catalog, public advertisement notice board, and applicant online registration portal.
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Drive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
