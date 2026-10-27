import React from 'react';
import { Application } from '../../types';
import { X, Printer, Building2, Calendar, MapPin, QrCode, ShieldCheck, Download } from 'lucide-react';

interface AdmitCardModalProps {
  application: Application;
  onClose: () => void;
}

export const AdmitCardModal: React.FC<AdmitCardModalProps> = ({ application, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Official Admit Card / Hall Ticket</h3>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] sm:text-xs font-semibold flex items-center space-x-1 shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Hall Ticket</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admit Card Document Body (Scrollable on small screens) */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white text-xs text-slate-700 flex-1 overflow-y-auto">
          {/* Header Seal */}
          <div className="text-center border-b border-slate-200 pb-3.5 space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight uppercase">
              National University of Technology & Sciences
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
              Centralized Recruitment Examination Admit Card — 2026
            </p>
            <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
              {application.advtNumber}
            </span>
          </div>

          {/* Candidate Profile Details & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
            <div className="sm:col-span-2 space-y-2">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Candidate Full Name</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{application.applicant.fullName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                <div>
                  <span className="text-slate-500 block">Roll Number:</span>
                  <span className="font-mono font-bold text-emerald-600 truncate block">{application.rollNumber || 'ROLL-2026-9921'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Application No:</span>
                  <span className="font-mono font-bold text-indigo-600 truncate block">{application.applicationNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-semibold text-slate-800">{application.applicant.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <span className="font-semibold text-slate-800">{application.applicant.dob}</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-1.5 flex flex-col items-center">
              <img
                src={application.applicant.photoUrl}
                alt="Candidate Photo"
                className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded border border-slate-300 shadow-xs"
              />
              <span className="text-[9px] font-mono text-slate-500 block">Verified Photo</span>
            </div>
          </div>

          {/* Applied Post & Test Venue Details */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
              Examination Schedule & Venue Allocation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Applied Position:</span>
                <span className="font-bold text-slate-900">{application.postTitle}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Department:</span>
                <span className="font-semibold text-indigo-600">{application.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Test Date & Time:</span>
                <span className="font-semibold text-amber-700">{application.examDateTime || 'April 20, 2026 (10:00 AM)'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Examination Center:</span>
                <span className="font-semibold text-slate-800">{application.examCenter || 'Main Campus Auditorium, Hall 3'}</span>
              </div>
            </div>
          </div>

          {/* Verification QR Code & Instructions */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                Security Instructions
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                1. Carry original government photo ID proof along with this printed hall ticket.
                <br />
                2. Electronic gadgets, smartphones, and calculators strictly prohibited.
              </p>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-900 text-center shrink-0">
              <QrCode className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
              <span className="text-[8px] font-mono block font-bold mt-0.5 text-slate-600">AUTH-VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
