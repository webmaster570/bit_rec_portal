import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { Application } from '../../types';
import { X, Printer, Building2, Calendar, MapPin, QrCode, ShieldCheck, User, CheckCircle2, Clock } from 'lucide-react';

interface AdmitCardModalProps {
  application: Application;
  onClose: () => void;
}

export const AdmitCardModal: React.FC<AdmitCardModalProps> = ({ application, onClose }) => {
  const { branding } = usePortal();
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden my-auto text-slate-900 border border-slate-200">
        {/* Actions Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-20 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recruitment Hall Ticket</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Official Copy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-md shadow-indigo-100"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT ADMIT CARD</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Admit Card Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 print:bg-white print:p-0">
          <div className="bg-white p-8 sm:p-10 border-2 border-slate-900 rounded-3xl shadow-sm print:border-0 print:shadow-none print:p-0 w-full max-w-full mx-auto relative overflow-hidden">
            
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 text-white flex items-center justify-center rotate-45 translate-x-16 -translate-y-16 print:hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] -rotate-45 mt-12 mr-4">ADMIT CARD</span>
            </div>

            {/* University Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2 relative">
              {/* Logo Section */}
              <div className="absolute left-0 top-0 w-20 h-20 flex items-center justify-center">
                {branding.logoImageUrl ? (
                  <img src={branding.logoImageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-slate-200" />
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 pl-20">Birla Institute of Technology</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] pl-20">Mesra, Ranchi - 835215, Jharkhand</p>
              <div className="pt-2 pl-20">
                <span className="px-4 py-1 bg-slate-100 text-slate-900 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-widest">
                  Examination Hall Ticket — 2026
                </span>
              </div>
            </div>

            <div className="pt-8 space-y-8">
              {/* Profile Section */}
              <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-12 md:col-span-9 space-y-6">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div className="col-span-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Full Name of Candidate</span>
                      <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{application.applicant.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Exam Roll Number</span>
                      <span className="text-base font-black text-indigo-700 font-mono tracking-wider">{application.rollNumber || 'T-2026-9021'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Application ID</span>
                      <span className="text-base font-bold text-slate-700 font-mono">{application.applicationNo}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Category</span>
                      <span className="text-sm font-bold text-slate-800">{application.applicant.category}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Date of Birth</span>
                      <span className="text-sm font-bold text-slate-800">{application.applicant.dob}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Photo */}
                <div className="col-span-12 md:col-span-3 flex flex-col items-center gap-3">
                  <div className="w-full aspect-[3/4] border-2 border-slate-900 rounded-2xl p-1 bg-white shadow-md">
                    <div className="w-full h-full border border-slate-100 rounded-xl overflow-hidden">
                      <img
                        src={application.applicant.photoUrl}
                        alt="Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="w-full h-10 border border-slate-200 rounded-lg flex items-center justify-center p-1 bg-slate-50">
                     {application.applicant.signatureUrl ? (
                        <img src={application.applicant.signatureUrl} alt="Signature" className="h-full w-auto object-contain" />
                     ) : (
                        <span className="text-[8px] font-bold text-slate-300 uppercase">Signature Attached</span>
                     )}
                  </div>
                </div>
              </div>

              {/* Schedule & Venue */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">Examination Schedule & Venue</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Reporting Date & Time</span>
                        <span className="text-sm font-black tracking-tight">{application.examDateTime || 'Monday, April 20, 2026 | 09:30 AM'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Position & Department</span>
                        <span className="text-sm font-black tracking-tight uppercase">{application.postTitle}</span>
                        <p className="text-[10px] text-indigo-300 font-bold">{application.departmentName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Venue Address</span>
                      <span className="text-sm font-black tracking-tight leading-relaxed">
                        {application.examCenter || 'Main Campus Auditorium, Block-B, First Floor, Hall 3, Mesra, Ranchi, Jharkhand - 835215'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Verification */}
              <div className="flex flex-col sm:flex-row gap-8 items-center justify-between border-t-2 border-slate-900 pt-8">
                <div className="space-y-4 flex-1">
                   <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Instructions for Candidate
                  </h4>
                  <ul className="space-y-1.5 text-[9px] font-bold text-slate-500 leading-tight">
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0" /> <span>Candidate must carry this original Hall Ticket and a valid Government Photo ID Proof.</span></li>
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0" /> <span>Reporting time is 60 minutes prior to the commencement of the examination.</span></li>
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0" /> <span>Electronic gadgets including mobile phones, calculators, and watches are strictly prohibited.</span></li>
                  </ul>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 border-2 border-slate-900 rounded-2xl bg-white">
                    <QrCode className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">System Verified</span>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="mt-12 text-center text-[8px] font-black uppercase text-slate-300 tracking-[0.3em] py-4 border-t border-slate-50">
               Issued by Recruitment Cell | Birla Institute of Technology, Mesra
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
