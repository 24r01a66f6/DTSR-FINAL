import React from 'react';
import { ResumeData } from './ModernTemplate';

export const MinimalistTemplate = ({ data }: { data: ResumeData }) => {
  return (
    <div id="resume-template-root" className="w-[794px] min-h-[1123px] bg-white px-16 py-14 text-slate-800 font-serif relative">
      {/* Centered Name and Contact */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2" data-type="header">
          {data.name || 'Your Full Name'}
        </h1>
        <div className="text-xs tracking-wide text-slate-500 flex justify-center flex-wrap gap-x-3 gap-y-1" data-type="text">
          {(data.email || 'email@example.com') && <span>{data.email || 'email@example.com'}</span>}
          <span>|</span>
          {(data.phone || '(555) 123-4567') && <span>{data.phone || '(555) 123-4567'}</span>}
          <span>|</span>
          {(data.location || 'City, State') && <span>{data.location || 'City, State'}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {(data.summary) && (
        <div className="mb-10">
          <p className="text-[13px] leading-relaxed text-slate-700 text-center italic whitespace-pre-wrap" data-type="text">
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && data.experience[0].title && (
        <div className="mb-10">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 text-center border-b border-slate-200 pb-1" data-type="header">
            Experience
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-slate-900 text-sm" data-type="header">{exp.title}</h3>
                <span className="text-[11px] font-medium text-slate-500 italic" data-type="text">{exp.date}</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-tight" data-type="header">{exp.company}</p>
              <p className="text-[13px] text-slate-700 leading-relaxed text-justify whitespace-pre-wrap" data-type="text">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {data.education && data.education.length > 0 && data.education[0].institution && (
        <div className="mb-10">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 text-center border-b border-slate-200 pb-1" data-type="header">
            Education
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-slate-900 text-sm" data-type="header">{edu.degree}</h3>
                <span className="text-[11px] font-medium text-slate-500 italic" data-type="text">{edu.date}</span>
              </div>
              <p className="text-[13px] text-slate-600" data-type="text">
                {edu.institution}{edu.gpa ? `, GPA: ${edu.gpa}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {data.skills && data.skills.filter(s => s.trim()).length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 text-center border-b border-slate-200 pb-1" data-type="header">
            Skills
          </h2>
          <p className="text-[13px] text-slate-700 text-center leading-relaxed" data-type="text">
            {data.skills.filter(s => s.trim()).join(' • ')}
          </p>
        </div>
      )}

      {/* Certifications Section */}
      {data.certifications && data.certifications.length > 0 && data.certifications[0].name && (
        <div className="mb-10">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 text-center border-b border-slate-200 pb-1" data-type="header">
            Certifications
          </h2>
          {data.certifications.map((cert, idx) => (
            <div key={idx} className="text-center mb-1.5">
              <p className="text-[13px] font-semibold text-slate-800" data-type="header">{cert.name} — <span className="font-medium text-slate-500">{cert.issuer} ({cert.date})</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
