import React from 'react';
import { ResumeData } from './ModernTemplate';

export const CreativeTemplate = ({ data }: { data: ResumeData }) => {
  return (
    <div id="resume-template-root" className="w-[794px] min-h-[1123px] bg-white flex relative overflow-hidden font-sans">
      {/* Sidebar - Bold Background */}
      <div className="w-1/3 bg-slate-900 text-white px-8 py-12 flex flex-col shrink-0">
        <div className="mb-12">
           <h1 className="text-3xl font-black uppercase leading-tight mb-2 tracking-tighter" data-type="header">
            {data.name || 'Your Name'}
           </h1>
           <div className="h-1 w-12 bg-rose-500 mb-6"></div>
        </div>

        <div className="space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Contact</h2>
            <div className="text-sm space-y-3 font-medium text-slate-200" data-type="text">
              <p className="flex items-center break-all">{data.email || 'email@example.com'}</p>
              <p>{data.phone || '(555) 123-4567'}</p>
              <p>{data.location || 'City, State'}</p>
            </div>
          </section>

          {/* Skills */}
          {data.skills && data.skills.filter(s => s.trim()).length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2" data-type="text">
                {data.skills.filter(s => s.trim()).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] font-bold rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && data.education[0].institution && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Education</h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-bold text-sm text-white" data-type="header">{edu.degree}</p>
                  <p className="text-xs text-slate-300" data-type="text">{edu.institution}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1" data-type="text">{edu.date}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-10 py-12 bg-white flex flex-col">
        {/* Summary */}
        {data.summary && (
          <section className="mb-12">
            <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center">
              About Me <span className="ml-3 h-[2px] flex-1 bg-slate-100"></span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap" data-type="text">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && data.experience[0].title && (
          <section className="mb-12">
            <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center">
              Experience <span className="ml-3 h-[2px] flex-1 bg-slate-100"></span>
            </h2>
            <div className="space-y-8">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-100 hover:border-rose-500 transition-colors">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 bg-white border-2 border-slate-200 rounded-full"></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 text-base" data-type="header">{exp.title}</h3>
                    <span className="text-[11px] font-black uppercase text-rose-500" data-type="text">{exp.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3" data-type="header">{exp.company}</p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap" data-type="text">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications - Bottom overlap */}
        {data.certifications && data.certifications.length > 0 && data.certifications[0].name && (
          <section className="mt-auto pt-8">
            <h2 className="text-xs font-black text-slate-900 mb-3 uppercase tracking-widest border-b border-slate-900 pb-1">Certifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.certifications.map((cert, idx) => (
                <div key={idx}>
                  <p className="text-xs font-bold text-slate-900" data-type="header">{cert.name}</p>
                  <p className="text-[10px] text-slate-500" data-type="text">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
