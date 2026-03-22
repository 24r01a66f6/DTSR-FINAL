import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Wand2, Loader2, Save, Download, Plus, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModernTemplate, ResumeData } from '../templates/ModernTemplate';
import { MinimalistTemplate } from '../templates/MinimalistTemplate';
import { CreativeTemplate } from '../templates/CreativeTemplate';
import api from '../utils/api';
import { resumeDataToBlocks, blocksToResumeData } from '../utils/resumeToBlocks';

const inputCls = "w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";
const sectionCls = "border-t border-slate-100 pt-6 mb-6";
const sectionTitle = "text-xl font-bold text-slate-900 mb-4 flex items-center justify-between";

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});
  const [score, setScore] = useState<number>(0);
  const [resumeDbId, setResumeDbId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore data from localStorage so toggling back from Builder doesn't lose form data
  const storageKey = `template-resume-data-${id}`;
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as ResumeData;
    } catch { }
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: '',
      experience: [{ title: '', company: '', date: '', description: '' }],
      education: [{ degree: '', institution: '', date: '', gpa: '' }],
      skills: [''],
      certifications: [{ name: '', issuer: '', date: '' }],
    };
  });

  // Persist to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(resumeData)); } catch { }
  }, [resumeData, storageKey]);

  // Fetch existing data from backend on load
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get('/resume');
        if (data && data.length > 0) {
          const latest = data[0];
          if (latest.layout && latest.layout.length > 0) {
            // Bi-directional sync: Convert canvas blocks back to structured form data
            const syncedData = blocksToResumeData(latest.layout);
            setResumeData(prev => ({ ...prev, ...syncedData }));
          }
          if (latest.score) setScore(latest.score);
          setResumeDbId(latest._id);
        }
      } catch (err) {
        console.error("Failed to fetch existing resume data", err);
      }
    };
    if (user) loadData();
  }, [user]);

  // ─── Field helpers ───────────────────────────────────────────────
  const setTop = (field: keyof ResumeData, val: string) =>
    setResumeData(prev => ({ ...prev, [field]: val }));

  const setExp = (i: number, field: string, val: string) =>
    setResumeData(prev => { const arr = [...prev.experience]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, experience: arr }; });
  const addExp = () => setResumeData(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', date: '', description: '' }] }));
  const removeExp = (i: number) => setResumeData(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));

  const setEdu = (i: number, field: string, val: string) =>
    setResumeData(prev => { const arr = [...prev.education]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, education: arr }; });
  const addEdu = () => setResumeData(prev => ({ ...prev, education: [...prev.education, { degree: '', institution: '', date: '', gpa: '' }] }));
  const removeEdu = (i: number) => setResumeData(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  const setSkill = (i: number, val: string) =>
    setResumeData(prev => { const arr = [...prev.skills]; arr[i] = val; return { ...prev, skills: arr }; });
  const addSkill = () => setResumeData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  const removeSkill = (i: number) => setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));

  const setCert = (i: number, field: string, val: string) =>
    setResumeData(prev => { const arr = [...(prev.certifications || [])]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, certifications: arr }; });
  const addCert = () => setResumeData(prev => ({ ...prev, certifications: [...(prev.certifications || []), { name: '', issuer: '', date: '' }] }));
  const removeCert = (i: number) => setResumeData(prev => ({ ...prev, certifications: (prev.certifications || []).filter((_, idx) => idx !== i) }));

  // ─── Backend handlers ────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (resumeDbId) {
        const { data } = await api.put(`/resume/${resumeDbId}`, { title: `${id} Template`, templateData: resumeData });
        if (data.score !== undefined) setScore(data.score);
      } else {
        const { data } = await api.post('/resume', { title: `${id} Template`, templateData: resumeData });
        setResumeDbId(data._id);
        if (data.score !== undefined) setScore(data.score);
      }
    } catch (err) {
      console.error('Failed to save template resume', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await api.post('/pdf/template', {
        resumeData,
        templateId: id,
        filename: `${resumeData.name || 'resume'}.pdf`,
      }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.name || 'resume'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCustomize = async () => {
    setIsConverting(true);
    try {
      // Use math-based layout converter instead of fragile DOM extraction
      // This produces perfectly aligned blocks that match the ModernTemplate visually
      // Note: currently resumeDataToBlocks is tuned for ModernTemplate. 
      // For minimalist, it will still work but might need a separate converter for pixel-perfection.
      const convertedBlocks = resumeDataToBlocks(resumeData);

      await api.post('/resume', {
        title: `${id} Custom Conversion`,
        layout: convertedBlocks
      });

      // Pass both blocks AND resumeData so Builder can regenerate on demand
      navigate('/builder', {
        state: {
          sourceTemplateId: id,
          initialBlocks: convertedBlocks,
          resumeData,
        }
      });
    } catch (err) {
      console.error('Failed to convert template to canvas blocks', err);
      setIsConverting(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(prev => ({ ...prev, summary: true }));
    try {
      const context = `Experience: ${resumeData.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join('; ')}. Skills: ${resumeData.skills.join(', ')}.`;
      const { data } = await api.post('/ai/generate', { type: 'summary', context });
      if (data.result) {
        setResumeData(prev => ({ ...prev, summary: data.result.trim() }));
      }
    } catch (err) {
      console.error("AI Summary generation failed", err);
    } finally {
      setIsGenerating(prev => ({ ...prev, summary: false }));
    }
  };

  const handleEnhanceBullets = async (index: number) => {
    const key = `exp-${index}`;
    setIsGenerating(prev => ({ ...prev, [key]: true }));
    try {
      const exp = resumeData.experience[index];
      const context = `Role: ${exp.title} at ${exp.company}. Description: ${exp.description}`;
      const { data } = await api.post('/ai/generate', { type: 'bullets', context });
      if (data.result) {
        setExp(index, 'description', data.result.trim());
      }
    } catch (err) {
      console.error("AI Bullet enhancement failed", err);
    } finally {
      setIsGenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSuggestSkills = async () => {
    setIsGenerating(prev => ({ ...prev, skills: true }));
    try {
      const context = `Experience: ${resumeData.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join('; ')}.`;
      const { data } = await api.post('/ai/generate', { type: 'skills', context });
      if (data.result) {
        const text = data.result.replace(/•|\*|-/g, '');
        const newSkills = text.split(/,|\n/).map((s: string) => s.trim()).filter((s: string) => s && !resumeData.skills.includes(s));
        if (newSkills.length > 0) {
          setResumeData(prev => ({ ...prev, skills: [...prev.skills.filter(s => s.trim()), ...newSkills] }));
        }
      }
    } catch (err) {
      console.error("AI Skill suggestions failed", err);
    } finally {
      setIsGenerating(prev => ({ ...prev, skills: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      <header className="h-16 flex-none bg-white border-b border-slate-200 shadow-sm z-20 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/templates')} className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group">
            <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-indigo-50 mr-2 transition-colors"><ArrowLeft className="h-4 w-4" /></div>
            <span className="text-sm font-medium hidden sm:block">Change Template</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-500 hidden sm:block">Editor Mode</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 relative">
            <div className="absolute left-1 inset-y-1 w-1/2 bg-white rounded-lg shadow-sm"></div>
            <button className="relative z-10 px-5 py-1.5 text-indigo-700 rounded-lg text-sm font-semibold pointer-events-none w-28 text-center">Template</button>
            <button onClick={handleCustomize} disabled={isConverting} className="relative z-10 px-5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-sm font-medium flex items-center justify-center transition-colors disabled:opacity-50 w-28">
              {isConverting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Customize
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Score</span>
              <span className={`text-sm font-bold ${score > 80 ? 'text-emerald-600' : score > 50 ? 'text-amber-500' : 'text-slate-600'}`}>{score}%</span>
            </div>
            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className={`h-full ${score > 80 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 ml-2">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Standard Form Editor */}
        <div className="flex-1 border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
          <div className="max-w-lg mx-auto p-6 pb-16">

            {/* Personal Info */}
            <h2 className="text-xl font-bold text-slate-900 mb-4">Personal Info</h2>
            <div className="space-y-4 mb-2">
              <div>
                <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={resumeData.name} onChange={e => setTop('name', e.target.value)} className={inputCls} placeholder="Jane Smith" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                  <input type="email" value={resumeData.email} onChange={e => setTop('email', e.target.value)} className={inputCls} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={resumeData.phone} onChange={e => setTop('phone', e.target.value)} className={inputCls} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input type="text" value={resumeData.location} onChange={e => setTop('location', e.target.value)} className={inputCls} placeholder="New York, NY" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input type="url" value={resumeData.linkedin || ''} onChange={e => setTop('linkedin', e.target.value)} className={inputCls} placeholder="linkedin.com/in/jane" />
                </div>
                <div>
                  <label className={labelCls}>Website / Portfolio</label>
                  <input type="url" value={resumeData.website || ''} onChange={e => setTop('website', e.target.value)} className={inputCls} placeholder="janesmith.dev" />
                </div>
                <div>
                  <label className={labelCls}>Personal Portfolio</label>
                  <input type="url" value={resumeData.portfolio || ''} onChange={e => setTop('portfolio', e.target.value)} className={inputCls} placeholder="behance.net/jane" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className={sectionCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Professional Summary</h2>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating.summary}
                  className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                >
                  {isGenerating.summary ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  <span>Generate with AI</span>
                </button>
              </div>
              <textarea rows={4} value={resumeData.summary} onChange={e => setTop('summary', e.target.value)} className={inputCls} placeholder="A results-driven professional with experience in..." />
            </div>

            {/* Experience */}
            <div className={sectionCls}>
              <div className={sectionTitle}>
                <span>Experience</span>
                <button onClick={addExp} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
              <div className="space-y-6">
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                    {resumeData.experience.length > 1 && (
                      <button onClick={() => removeExp(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Job Title</label>
                        <input value={exp.title} onChange={e => setExp(i, 'title', e.target.value)} className={inputCls} placeholder="Software Engineer" />
                      </div>
                      <div>
                        <label className={labelCls}>Company</label>
                        <input value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} className={inputCls} placeholder="Acme Corp" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Date Range</label>
                      <input value={exp.date} onChange={e => setExp(i, 'date', e.target.value)} className={inputCls} placeholder="Jan 2021 – Present" />
                    </div>
                    <div>
                      <label className={labelCls}>Description / Achievements</label>
                      <div className="relative">
                        <textarea
                          rows={4}
                          value={exp.description}
                          onChange={e => setExp(i, 'description', e.target.value)}
                          className={`${inputCls} pr-10`}
                          placeholder="Accomplished X by doing Y..."
                        />
                        <button
                          onClick={() => handleEnhanceBullets(i)}
                          disabled={isGenerating[`exp-${i}`]}
                          title="Enhance with AI"
                          className="absolute right-2 top-2 p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all disabled:opacity-50"
                        >
                          {isGenerating[`exp-${i}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className={sectionCls}>
              <div className={sectionTitle}>
                <span>Education</span>
                <button onClick={addEdu} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
              <div className="space-y-5">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                    {resumeData.education.length > 1 && (
                      <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    )}
                    <div>
                      <label className={labelCls}>Degree / Program</label>
                      <input value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} className={inputCls} placeholder="B.S. Computer Science" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Institution</label>
                        <input value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} className={inputCls} placeholder="MIT" />
                      </div>
                      <div>
                        <label className={labelCls}>Graduation</label>
                        <input value={edu.date} onChange={e => setEdu(i, 'date', e.target.value)} className={inputCls} placeholder="May 2022" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>GPA (optional)</label>
                      <input value={edu.gpa || ''} onChange={e => setEdu(i, 'gpa', e.target.value)} className={inputCls} placeholder="3.8 / 4.0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className={sectionCls}>
              <div className={sectionTitle}>
                <div className="flex items-center space-x-2">
                  <span>Skills</span>
                  <button
                    onClick={handleSuggestSkills}
                    disabled={isGenerating.skills}
                    className="flex items-center space-x-1 text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isGenerating.skills ? <Loader2 className="h-2 w-2 animate-spin" /> : <Sparkles className="h-2 w-2" />}
                    <span>Suggest Skills</span>
                  </button>
                </div>
                <button onClick={addSkill} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, i) => (
                  <div key={i} className="flex items-center bg-indigo-50 border border-indigo-100 rounded-full px-1 pr-2">
                    <input
                      value={skill}
                      onChange={e => setSkill(i, e.target.value)}
                      className="w-28 bg-transparent text-sm text-indigo-800 px-2 py-1 outline-none placeholder-indigo-300"
                      placeholder="e.g. Python"
                    />
                    {resumeData.skills.length > 1 && (
                      <button onClick={() => removeSkill(i)} className="text-indigo-300 hover:text-red-400 transition-colors ml-0.5"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className={sectionCls}>
              <div className={sectionTitle}>
                <span>Certifications</span>
                <button onClick={addCert} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
              <div className="space-y-4">
                {(resumeData.certifications || []).map((cert, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                    {(resumeData.certifications || []).length > 1 && (
                      <button onClick={() => removeCert(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    )}
                    <div>
                      <label className={labelCls}>Certification Name</label>
                      <input value={cert.name} onChange={e => setCert(i, 'name', e.target.value)} className={inputCls} placeholder="AWS Solutions Architect" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Issuing Organization</label>
                        <input value={cert.issuer} onChange={e => setCert(i, 'issuer', e.target.value)} className={inputCls} placeholder="Amazon" />
                      </div>
                      <div>
                        <label className={labelCls}>Date Earned</label>
                        <input value={cert.date} onChange={e => setCert(i, 'date', e.target.value)} className={inputCls} placeholder="Mar 2023" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customize hint */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start">
                <Wand2 className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm text-indigo-900 font-medium">
                  Want full control over layout? Switch to <strong>Customize</strong> mode to drag and reposition every element freely.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Live HTML Template Render */}
        <div className="flex-[1.5] bg-slate-200/50 p-8 flex justify-center overflow-y-auto relative">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-none shadow-2xl origin-top transition-transform duration-300"
            ref={containerRef}
            style={{
              transform: 'scale(0.8) translateY(-10%)',
              width: '794px',
              transformOrigin: 'top center'
            }}
          >
            {id === 'minimalist' ? (
              <MinimalistTemplate data={resumeData} />
            ) : id === 'creative' ? (
              <CreativeTemplate data={resumeData} />
            ) : (
              <ModernTemplate data={resumeData} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
