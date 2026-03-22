import React from 'react';

// Common interface for the data we expect from the TemplateEditor's forms
export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  portfolio?: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    date: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    date: string;
    gpa?: string;
  }[];
  skills: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export const ModernTemplate = ({ data }: { data: ResumeData }) => {
  return (
    <div id="resume-template-root" className="w-[794px] min-h-[1123px] bg-white px-12 py-10 text-slate-800 font-sans relative">
      {/* Name and Contact Header */}
      <div className="mb-7 border-b-2 border-slate-200 pb-5 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 uppercase" data-type="header">
          {data.name || 'Your Full Name'}
        </h1>
        <div className="text-sm font-medium text-slate-500 flex justify-center flex-wrap gap-x-4 gap-y-1" data-type="text">
          {(data.email || 'email@example.com') && <span>{data.email || 'email@example.com'}</span>}
          {(data.phone || '(555) 123-4567') && <><span>•</span><span>{data.phone || '(555) 123-4567'}</span></>}
          {(data.location || 'City, State') && <><span>•</span><span>{data.location || 'City, State'}</span></>}
          {data.linkedin && <><span>•</span><span>{data.linkedin}</span></>}
          {data.website && <><span>•</span><span>{data.website}</span></>}
          {data.portfolio && <><span>•</span><span>{data.portfolio}</span></>}
        </div>
      </div>

      {/* Professional Summary */}
      {(data.summary) && (
        <div className="mb-7">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1" data-type="header">
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap" data-type="text">
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && data.experience[0].title && (
        <div className="mb-7">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1" data-type="header">
            Experience
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-5">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-slate-900 text-sm" data-type="header">{exp.title}</h3>
                <span className="text-xs font-semibold text-slate-500" data-type="text">{exp.date}</span>
              </div>
              <p className="text-xs font-semibold text-indigo-600 mb-1.5" data-type="header">{exp.company}</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" data-type="text">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {data.education && data.education.length > 0 && data.education[0].institution && (
        <div className="mb-7">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1" data-type="header">
            Education
          </h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-slate-900 text-sm" data-type="header">{edu.degree}</h3>
                <span className="text-xs font-semibold text-slate-500" data-type="text">{edu.date}</span>
              </div>
              <p className="text-xs font-medium text-indigo-600" data-type="text">
                {edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {data.skills && data.skills.filter(s => s.trim()).length > 0 && (
        <div className="mb-7">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1" data-type="header">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2" data-type="text">
            {data.skills.filter(s => s.trim()).map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {data.certifications && data.certifications.length > 0 && data.certifications[0].name && (
        <div className="mb-7">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1" data-type="header">
            Certifications
          </h2>
          {data.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between items-baseline mb-2">
              <p className="text-sm font-semibold text-slate-800" data-type="header">{cert.name}</p>
              <span className="text-xs text-slate-500" data-type="text">{cert.issuer} · {cert.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
