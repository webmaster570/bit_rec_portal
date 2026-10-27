import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { X, Plus, Building2, DollarSign, Layers } from 'lucide-react';

interface ConfigurePostModalProps {
  isOpen: boolean;
  driveId: string;
  onClose: () => void;
}

export const ConfigurePostModal: React.FC<ConfigurePostModalProps> = ({
  isOpen,
  driveId,
  onClose,
}) => {
  const { addPostToDrive, departments } = usePortal();

  const [postCode, setPostCode] = useState(`POST-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState('Associate Professor (Mechanical Engg)');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-01');
  const [payScale, setPayScale] = useState('Level 13A (₹1,31,400 - ₹2,17,100)');
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(45);
  const [minQualification, setMinQualification] = useState('Ph.D. with First Class M.Tech and minimum 6 journal publications');
  const [requiredExperienceYears, setRequiredExperienceYears] = useState(6);
  const [applicationFee, setApplicationFee] = useState(1200);

  const [vacancies, setVacancies] = useState({
    UR: 3,
    OBC: 2,
    SC: 1,
    ST: 1,
    EWS: 1,
    PwD: 0,
  });

  if (!isOpen) return null;

  const totalVacancies = (Object.values(vacancies) as number[]).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = departments.find((d) => d.id === departmentId);

    addPostToDrive(driveId, {
      postCode,
      title,
      departmentId,
      departmentName: deptObj?.name || 'Department',
      payScale,
      vacanciesTotal: totalVacancies,
      vacanciesBreakdown: vacancies,
      minAge,
      maxAge,
      minQualification,
      requiredExperienceYears,
      applicationFee,
      feeExemptCategories: ['SC', 'ST', 'PwD'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Configure Position / Post Vacancy</h3>
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
                Post Code / ID
              </label>
              <input
                type="text"
                required
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pay Level / Scale</label>
              <input
                type="text"
                required
                value={payScale}
                onChange={(e) => setPayScale(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Fee (₹)</label>
              <input
                type="number"
                required
                value={applicationFee}
                onChange={(e) => setApplicationFee(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Category Reservation Vacancy Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold text-slate-800">
                Reservation Quotas & Vacancy Breakdown
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                Total: {totalVacancies} Vacancies
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">UR (Gen)</label>
                <input
                  type="number"
                  value={vacancies.UR}
                  onChange={(e) => setVacancies({ ...vacancies, UR: Number(e.target.value) })}
                  className="w-full bg-white text-center border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">OBC</label>
                <input
                  type="number"
                  value={vacancies.OBC}
                  onChange={(e) => setVacancies({ ...vacancies, OBC: Number(e.target.value) })}
                  className="w-full bg-white text-center border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">SC</label>
                <input
                  type="number"
                  value={vacancies.SC}
                  onChange={(e) => setVacancies({ ...vacancies, SC: Number(e.target.value) })}
                  className="w-full bg-white text-center border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">ST</label>
                <input
                  type="number"
                  value={vacancies.ST}
                  onChange={(e) => setVacancies({ ...vacancies, ST: Number(e.target.value) })}
                  className="w-full bg-white text-center border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">EWS</label>
                <input
                  type="number"
                  value={vacancies.EWS}
                  onChange={(e) => setVacancies({ ...vacancies, EWS: Number(e.target.value) })}
                  className="w-full bg-white text-center border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">PwD</label>
                <input
                  type="number"
                  value={vacancies.PwD}
                  onChange={(e) => setVacancies({ ...vacancies, PwD: Number(e.target.value) })}
                  className="w-full bg-white text-center border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Age Limit</label>
              <input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Age Limit</label>
              <input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Req. Experience (Years)</label>
              <input
                type="number"
                value={requiredExperienceYears}
                onChange={(e) => setRequiredExperienceYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Educational Qualification
            </label>
            <textarea
              rows={2}
              value={minQualification}
              onChange={(e) => setMinQualification(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
            ></textarea>
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
              <span>Save Position</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
