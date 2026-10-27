import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { PostConfig } from '../../types';
import { X, Layers, Save, Building2 } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  driveId: string;
  post: PostConfig | null;
  onClose: () => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  driveId,
  post,
  onClose,
}) => {
  const { updatePostInDrive, departments } = usePortal();

  const [formData, setFormData] = useState({
    postCode: '',
    title: '',
    departmentId: '',
    payScale: '',
    minAge: 21,
    maxAge: 45,
    minQualification: '',
    requiredExperienceYears: 0,
    applicationFee: 1000,
  });

  const [vacancies, setVacancies] = useState({
    UR: 0,
    OBC: 0,
    SC: 0,
    ST: 0,
    EWS: 0,
    PwD: 0,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        postCode: post.postCode || '',
        title: post.title || '',
        departmentId: post.departmentId || departments[0]?.id || '',
        payScale: post.payScale || '',
        minAge: post.minAge || 21,
        maxAge: post.maxAge || 45,
        minQualification: post.minQualification || '',
        requiredExperienceYears: post.requiredExperienceYears || 0,
        applicationFee: post.applicationFee || 1000,
      });
      setVacancies({
        UR: post.vacanciesBreakdown?.UR || 0,
        OBC: post.vacanciesBreakdown?.OBC || 0,
        SC: post.vacanciesBreakdown?.SC || 0,
        ST: post.vacanciesBreakdown?.ST || 0,
        EWS: post.vacanciesBreakdown?.EWS || 0,
        PwD: post.vacanciesBreakdown?.PwD || 0,
      });
    }
  }, [post, departments]);

  if (!isOpen || !post) return null;

  const totalVacancies = (Object.values(vacancies) as number[]).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = departments.find((d) => d.id === formData.departmentId);

    updatePostInDrive(driveId, post.id, {
      ...formData,
      departmentName: deptObj?.name || post.departmentName,
      vacanciesTotal: totalVacancies,
      vacanciesBreakdown: vacancies,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Edit Vacancy Position</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Post Code / ID
              </label>
              <input
                type="text"
                required
                value={formData.postCode}
                onChange={(e) => setFormData({ ...formData, postCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Post Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Level / Scale</label>
              <input
                type="text"
                required
                value={formData.payScale}
                onChange={(e) => setFormData({ ...formData, payScale: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Fee (₹)</label>
              <input
                type="number"
                required
                value={formData.applicationFee}
                onChange={(e) => setFormData({ ...formData, applicationFee: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Vacancy Breakdown */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800">Category Reservation Matrix</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                Total: {totalVacancies} Vacancies
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {(['UR', 'OBC', 'SC', 'ST', 'EWS', 'PwD'] as const).map((cat) => (
                <div key={cat}>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">{cat}</label>
                  <input
                    type="number"
                    min="0"
                    value={vacancies[cat]}
                    onChange={(e) => setVacancies({ ...vacancies, [cat]: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center text-xs font-bold text-slate-900"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Age Limits and Experience */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Min Age</label>
              <input
                type="number"
                value={formData.minAge}
                onChange={(e) => setFormData({ ...formData, minAge: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Max Age</label>
              <input
                type="number"
                value={formData.maxAge}
                onChange={(e) => setFormData({ ...formData, maxAge: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Exp (Years)</label>
              <input
                type="number"
                value={formData.requiredExperienceYears}
                onChange={(e) => setFormData({ ...formData, requiredExperienceYears: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Minimum Qualifications</label>
            <textarea
              rows={2}
              value={formData.minQualification}
              onChange={(e) => setFormData({ ...formData, minQualification: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Position</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
