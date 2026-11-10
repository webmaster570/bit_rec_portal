import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Application, RecruitmentDrive } from '../../types';

interface Props {
  application: Partial<Application>;
  drive?: RecruitmentDrive;
  onClose: () => void;
}

export const ApplicationPreviewModal: React.FC<Props> = ({ application, drive, onClose }) => {
  const post = drive?.posts.find(p => p.id === application.postId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Preview</h2>
            <p className="text-xs text-slate-500">Draft format as per University standards</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Print Application"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 print:bg-white print:p-0">
          <div className="bg-white shadow-sm border border-slate-200 p-12 max-w-[210mm] mx-auto min-h-[297mm] print:shadow-none print:border-0 print:p-8">
            
            {/* PDF Layout Starts Here */}
            <div className="space-y-8 text-[11pt] leading-normal text-black font-serif">
              
              {/* PART A */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART A – ADVERTISEMENT AND POST DETAILS</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex"><span className="w-8">1.</span> <span className="w-64">Advertisement Number:</span> <span className="border-b border-dotted border-black flex-1">{drive?.advtNumber || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">2.</span> <span className="w-64">Advertisement Date:</span> <span className="border-b border-dotted border-black flex-1">{drive?.startDate || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">3.</span> <span className="w-64">Name of the Post Applied For:</span> <span className="border-b border-dotted border-black flex-1 uppercase font-bold">{application.postTitle || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">4.</span> <span className="w-64">Post Code:</span> <span className="border-b border-dotted border-black flex-1">{post?.postCode || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">5.</span> <span className="w-64">Department/Section:</span> <span className="border-b border-dotted border-black flex-1 uppercase">{application.departmentName || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">6.</span> <span className="w-64">Group:</span> <span className="border-b border-dotted border-black flex-1">A / B / C</span></div>
                  <div className="flex"><span className="w-8">7.</span> <span className="w-64">Pay Level as per 7th CPC:</span> <span className="border-b border-dotted border-black flex-1">{post?.payScale || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">8.</span> <span className="w-64">Category of Vacancy:</span> <span className="border-b border-dotted border-black flex-1">UR / SC / ST / OBC-NCL / EWS / PwBD</span></div>
                  <div className="flex"><span className="w-8">9.</span> <span className="w-64">Nature of Appointment:</span> <span className="border-b border-dotted border-black flex-1">Regular / Deputation / Contract</span></div>
                  <div className="flex"><span className="w-8">10.</span> <span className="w-64">Recruitment Quota:</span> <span className="border-b border-dotted border-black flex-1">Direct Recruitment / Deputation</span></div>
                </div>
              </section>

              {/* PART B */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART B – APPLICANT REGISTRATION DETAILS</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex"><span className="w-8">1.</span> <span className="w-64">Applicant Registration ID:</span> <span className="border-b border-dotted border-black flex-1 font-mono">{application.applicant?.regNumber || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">2.</span> <span className="w-64">Application Number (system generated):</span> <span className="border-b border-dotted border-black flex-1 font-mono font-bold">{application.applicationNo || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">3.</span> <span className="w-64">Registered Email ID:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.email || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">4.</span> <span className="w-64">Registered Mobile Number:</span> <span className="border-b border-dotted border-black flex-1 font-mono">{application.applicant?.mobile || '__________________'}</span></div>
                  <div className="flex"><span className="w-8">5.</span> <span className="w-64">Date of Application:</span> <span className="border-b border-dotted border-black flex-1">{application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : '__________________'}</span></div>
                </div>
              </section>

              {/* PART C */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART C – PERSONAL INFORMATION</h3>
                <div className="space-y-2 ml-4">
                  <div className="flex"><span className="w-8">1.</span> <span className="w-64">First Name:</span> <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{application.applicant?.firstName || application.applicant?.fullName?.split(' ')[0] || ''}</span></div>
                  <div className="flex"><span className="w-8">2.</span> <span className="w-64">Middle Name:</span> <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{application.applicant?.middleName || ''}</span></div>
                  <div className="flex"><span className="w-8">3.</span> <span className="w-64">Last Name:</span> <span className="border-b border-dotted border-black flex-1 font-bold uppercase">{application.applicant?.lastName || application.applicant?.fullName?.split(' ').slice(1).join(' ') || ''}</span></div>
                  <div className="flex"><span className="w-8">4.</span> <span className="w-64">Father's Name:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.fatherName || ''}</span></div>
                  <div className="flex"><span className="w-8">5.</span> <span className="w-64">Mother's Name:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.motherName || ''}</span></div>
                  <div className="flex"><span className="w-8">6.</span> <span className="w-64">Date of Birth:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.dob || ''}</span></div>
                  <div className="flex"><span className="w-8">7.</span> <span className="w-64">Gender:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.gender || ''}</span></div>
                  <div className="flex"><span className="w-8">8.</span> <span className="w-64">Nationality:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.nationality || ''}</span></div>
                  <div className="flex"><span className="w-8">9.</span> <span className="w-64">Marital Status:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.maritalStatus || ''}</span></div>
                  <div className="flex"><span className="w-8">10.</span> <span className="w-64">Social Category:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.category || ''}</span></div>
                  <div className="flex"><span className="w-8">11.</span> <span className="w-64">Sub-category, if applicable:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.subCategory || ''}</span></div>
                  <div className="flex"><span className="w-8">12.</span> <span className="w-64">Category Certificate Number:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.categoryCertificateNo || ''}</span></div>
                  <div className="flex"><span className="w-8">13.</span> <span className="w-64">Date of Issue of Certificate:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.categoryCertificateDate || ''}</span></div>
                  <div className="flex"><span className="w-8">14.</span> <span className="w-64">Issuing Authority:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.categoryIssuingAuthority || ''}</span></div>
                  <div className="flex"><span className="w-8">15.</span> <span className="w-64">PwBD Status:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.isPwD ? 'Yes' : 'No'}</span></div>
                  <div className="flex"><span className="w-8">16.</span> <span className="w-64">Disability Percentage, if applicable:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.disabilityPercentage || ''}</span></div>
                  <div className="flex"><span className="w-8">17.</span> <span className="w-64">Aadhaar/Other ID:</span> <span className="border-b border-dotted border-black flex-1">{application.applicant?.aadhaarNumber || application.applicant?.idProofNumber || ''}</span></div>
                </div>
              </section>

              {/* Address and Identification Photos */}
              <section className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-4">
                  <div>
                    <h4 className="font-bold underline mb-2">Address for Correspondence</h4>
                    <div className="space-y-1 text-[10pt]">
                      <div className="flex"><span className="w-4">•</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.correspondenceAddress || application.applicant?.address || ''}</span></div>
                      <div className="flex"><span className="w-24">City:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.correspondenceCity || application.applicant?.district || ''}</span></div>
                      <div className="flex"><span className="w-24">District:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.correspondenceDistrict || application.applicant?.district || ''}</span></div>
                      <div className="flex"><span className="w-24">State:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.correspondenceState || application.applicant?.state || ''}</span></div>
                      <div className="flex"><span className="w-24">PIN:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.correspondencePin || application.applicant?.pin || ''}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold underline mb-2">Permanent Address</h4>
                    <div className="space-y-1 text-[10pt]">
                      <div className="flex"><span className="w-4">•</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.permanentAddress || application.applicant?.address || ''}</span></div>
                      <div className="flex"><span className="w-24">City:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.permanentCity || application.applicant?.district || ''}</span></div>
                      <div className="flex"><span className="w-24">District:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.permanentDistrict || application.applicant?.district || ''}</span></div>
                      <div className="flex"><span className="w-24">State:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.permanentState || application.applicant?.state || ''}</span></div>
                      <div className="flex"><span className="w-24">PIN:</span> <span className="flex-1 border-b border-dotted border-black">{application.applicant?.permanentPin || application.applicant?.pin || ''}</span></div>
                    </div>
                  </div>
                </div>

                {/* Photo and Signature */}
                <div className="col-span-2 flex justify-end gap-8">
                  <div className="text-center space-y-2">
                    <span className="text-[10pt] font-bold block mb-1 uppercase">Passport Photo</span>
                    <div className="w-32 h-40 border border-black p-1 flex items-center justify-center bg-white">
                      {application.applicant?.photoUrl ? (
                        <img src={application.applicant.photoUrl} alt="Photo" className="max-w-full max-h-full object-cover" />
                      ) : (
                        <div className="text-slate-300 text-[10px]">Affix Photo</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <span className="text-[10pt] font-bold block mb-1 uppercase">Signature</span>
                    <div className="w-48 h-20 border border-black p-1 flex items-center justify-center bg-white">
                      {application.applicant?.signatureUrl ? (
                        <img src={application.applicant.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="text-slate-300 text-[10px]">Candidate's Signature</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* PART D */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART D – EDUCATIONAL QUALIFICATIONS</h3>
                <table className="w-full border-collapse border border-black text-[9pt]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-black p-1">Examination/Degree</th>
                      <th className="border border-black p-1">Board/University</th>
                      <th className="border border-black p-1">Subject/Specialization</th>
                      <th className="border border-black p-1 w-16">Year</th>
                      <th className="border border-black p-1">Marks/CGPA</th>
                      <th className="border border-black p-1 w-16">Division</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.academics?.map((acad, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-1">{acad.degree}</td>
                        <td className="border border-black p-1">{acad.boardOrUniversity}</td>
                        <td className="border border-black p-1">{acad.fieldOfStudy || acad.subjects}</td>
                        <td className="border border-black p-1 text-center">{acad.passingYear}</td>
                        <td className="border border-black p-1 text-center">{acad.gradeOrPercentage || acad.cgpa}</td>
                        <td className="border border-black p-1 text-center">{acad.division}</td>
                      </tr>
                    ))}
                    {(!application.academics || application.academics.length === 0) && [1,2,3,4].map(i => (
                      <tr key={i}><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td></tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* PART E */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART E – EMPLOYMENT AND EXPERIENCE DETAILS</h3>
                <table className="w-full border-collapse border border-black text-[9pt]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-black p-1">Organization</th>
                      <th className="border border-black p-1">Designation</th>
                      <th className="border border-black p-1 w-16">From</th>
                      <th className="border border-black p-1 w-16">To</th>
                      <th className="border border-black p-1">Nature of Duties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.experience?.map((exp, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-1">{exp.organization}</td>
                        <td className="border border-black p-1">{exp.designation}</td>
                        <td className="border border-black p-1 text-center">{exp.startDate}</td>
                        <td className="border border-black p-1 text-center">{exp.endDate || 'Present'}</td>
                        <td className="border border-black p-1">{exp.jobDescription}</td>
                      </tr>
                    ))}
                    {(!application.experience || application.experience.length === 0) && [1,2].map(i => (
                      <tr key={i}><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td><td className="border border-black p-4"></td></tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* PART F */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART F – RESEARCH AND PUBLICATIONS</h3>
                <div className="space-y-4 ml-4 text-[10pt]">
                  <div>
                    <h4 className="font-bold underline mb-1">Research Papers/Review Articles/Conference Proceedings:</h4>
                    <p className="whitespace-pre-wrap border border-slate-200 p-2 min-h-[40px] bg-slate-50/30">
                      {application.researchPapers || 'Not Provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold underline mb-1">Research Publication – Books, Chapters, Edited Works, Articles:</h4>
                    <p className="whitespace-pre-wrap border border-slate-200 p-2 min-h-[40px] bg-slate-50/30">
                      {application.researchPublications || 'Not Provided'}
                    </p>
                  </div>
                </div>
              </section>

              {/* MISCELLANEOUS INFORMATION & DISCLOSURES */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">MISCELLANEOUS INFORMATION & DISCLOSURES</h3>
                <div className="space-y-4 ml-4 text-[10pt]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between border-b border-dotted border-black">
                      <span>1. Time required for joining:</span>
                      <span className="font-bold">{application.joiningTimeRequired || 'Not Specified'}</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-black">
                      <span>2. Computer proficiency certificate:</span>
                      <span className="font-bold">{application.hasComputerProficiency ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold underline mb-1">3. Contribution to institutions where you have worked:</h4>
                    <p className="whitespace-pre-wrap border border-slate-200 p-2 min-h-[40px] bg-slate-50/30">
                      {application.institutionalContribution || 'None'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold underline mb-1">4. What makes you suitable for the job:</h4>
                    <p className="whitespace-pre-wrap border border-slate-200 p-2 min-h-[40px] bg-slate-50/30">
                      {application.suitabilityStatement || 'None'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold underline mb-1">5. Honours and awards:</h4>
                    <p className="whitespace-pre-wrap border border-slate-200 p-2 min-h-[40px] bg-slate-50/30">
                      {application.honoursAndAwards || 'None'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold underline mb-1">Legal & Disciplinary History:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { label: '6. Debarred/punished for unfair means in examination:', val: application.debarredForUnfairMeans },
                        { label: '7. Involved in administrative malpractice:', val: application.administrativeMalpractice },
                        { label: '8. Involved in financial irregularity:', val: application.financialIrregularity },
                        { label: '9. Discharged or dismissed from employment:', val: application.dischargedOrDismissed },
                        { label: '10. Pending disciplinary proceeding:', val: application.pendingDisciplinaryProceeding },
                        { label: '11. Declared medically unfit or asked to resign:', val: application.medicallyUnfitResignation },
                        { label: '14. No objection certificate available:', val: application.nocAvailable },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-dotted border-slate-300 pb-0.5">
                          <span>{item.label}</span>
                          <span className="font-bold">{item.val ? 'Yes' : 'No'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold underline mb-2">12. Professional Referees:</h4>
                    <table className="w-full border-collapse border border-black text-[9pt]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-black p-1">Name & Designation</th>
                          <th className="border border-black p-1">Address</th>
                          <th className="border border-black p-1">Email & Mobile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {application.referees?.map((ref, idx) => (
                          <tr key={idx}>
                            <td className="border border-black p-1">
                              <div className="font-bold">{ref.name}</div>
                              <div>{ref.designation}</div>
                            </td>
                            <td className="border border-black p-1">{ref.address}</td>
                            <td className="border border-black p-1">
                              <div>{ref.email}</div>
                              <div>{ref.mobile}</div>
                            </td>
                          </tr>
                        )) || (
                          <tr><td colSpan={3} className="border border-black p-2 text-center italic text-slate-400">No referees provided</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between border-b border-dotted border-black">
                    <span className="font-bold">13. Languages Known:</span>
                    <span>{application.languagesKnown || 'Not Specified'}</span>
                  </div>
                </div>
              </section>

              {/* PART G */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART G – ELIGIBILITY AND OTHER DECLARATIONS</h3>
                <div className="space-y-1 text-[10pt] ml-4">
                  <div className="flex justify-between"><span>1. Whether fulfilling the prescribed educational qualifications:</span> <span className="font-bold">{application.fulfillsQualifications !== undefined ? (application.fulfillsQualifications ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>2. Whether fulfilling the prescribed experience requirements:</span> <span className="font-bold">{application.fulfillsExperience !== undefined ? (application.fulfillsExperience ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>3. Whether age criteria are fulfilled:</span> <span className="font-bold">{application.fulfillsAgeCriteria !== undefined ? (application.fulfillsAgeCriteria ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>4. Whether relaxation is claimed:</span> <span className="font-bold">{application.isRelaxationClaimed !== undefined ? (application.isRelaxationClaimed ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>5. Whether currently employed:</span> <span className="font-bold">{application.isCurrentlyEmployed !== undefined ? (application.isCurrentlyEmployed ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>6. Whether NOC is required:</span> <span className="font-bold">{application.isNocRequired !== undefined ? (application.isNocRequired ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>7. Whether any disciplinary proceedings are pending:</span> <span className="font-bold">{application.disciplinaryPending !== undefined ? (application.disciplinaryPending ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>8. Whether any criminal proceedings/conviction are required to be disclosed:</span> <span className="font-bold">{application.criminalDisclosed !== undefined ? (application.criminalDisclosed ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>9. Whether previously applied for the same post:</span> <span className="font-bold">{application.previouslyAppliedSamePost !== undefined ? (application.previouslyAppliedSamePost ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                  <div className="flex justify-between"><span>10. Whether debarred from any recruitment examination:</span> <span className="font-bold">{application.debarredFromExams !== undefined ? (application.debarredFromExams ? 'Yes' : 'No') : 'Yes / No'}</span></div>
                </div>
              </section>

              {/* PART H - UPLOADED DOCUMENTS */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART H – LIST OF DOCUMENTS UPLOADED</h3>
                <div className="ml-4">
                  {application.documents && application.documents.length > 0 ? (
                    <ul className="space-y-1 text-[10pt]">
                      {application.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-6">{idx + 1}.</span>
                          <span className="w-48 font-semibold uppercase">{doc.type.replace(/_/g, ' ')}:</span>
                          <span className="flex-1">{doc.name}</span>
                          <span className="text-[8pt] text-slate-500">({doc.fileSize})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10pt] italic text-slate-500">No documents uploaded.</p>
                  )}
                </div>
              </section>

              {/* PART J */}
              <section>
                <h3 className="font-bold border-b border-black pb-1 mb-4 uppercase tracking-wider text-[12pt]">PART J – APPLICANT'S DECLARATION</h3>
                <p className="text-[10pt] leading-relaxed text-justify mb-8">
                  I hereby declare that all particulars furnished in this application are true, complete and correct to the best of my knowledge and belief. I understand that my candidature shall be liable to cancellation at any stage of recruitment if any information furnished by me is found to be false, misleading, incomplete or suppressed, or if I am found ineligible under the applicable recruitment rules and conditions prescribed in the advertisement.
                </p>
                <div className="flex justify-between mt-12 items-end">
                  <div className="space-y-4">
                    <div className="flex gap-2"><span>Place:</span> <span className="w-48 border-b border-black">{application.place || '________________'}</span></div>
                    <div className="flex gap-2"><span>Date:</span> <span className="w-48 border-b border-black">{application.date || new Date().toLocaleDateString()}</span></div>
                  </div>
                  <div className="text-center">
                    <div className="w-48 h-12 border-b border-black mb-1"></div>
                    <span className="text-[9pt] uppercase font-bold">Applicant's Signature</span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
