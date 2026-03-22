import { useState } from 'react';
import { Layers, User, Briefcase, GraduationCap, Award, Settings, Download } from 'lucide-react';
import { useResume } from '../context/ResumeContext';

export default function Builder() {
  const [activeTab, setActiveTab] = useState('personal');
  const { data, updatePersonalInfo } = useResume();
  const { personalInfo, experience } = data;

  const tabs = [
    { id: 'personal', icon: User, label: 'Personal' },
    { id: 'experience', icon: Briefcase, label: 'Experience' },
    { id: 'education', icon: GraduationCap, label: 'Education' },
    { id: 'skills', icon: Award, label: 'Skills' },
    { id: 'layout', icon: Layers, label: 'Layout' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      
      {/* Sidebar Navigation */}
      <div className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-6 shadow-sm z-10 print:hidden">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-8 shadow-md">
          <Layers className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col space-y-4 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
              title={tab.label}
            >
              <tab.icon className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Panel */}
      <div className="w-80 bg-white border-r border-gray-100 shadow-lg z-20 overflow-y-auto print:hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 capitalize">{activeTab} Info</h2>
          
          <div className="space-y-4">
            {activeTab === 'personal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" value={personalInfo.fullName} onChange={(e) => updatePersonalInfo({ fullName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input type="text" value={personalInfo.jobTitle} onChange={(e) => updatePersonalInfo({ jobTitle: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="text" value={personalInfo.email} onChange={(e) => updatePersonalInfo({ email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" value={personalInfo.phone} onChange={(e) => updatePersonalInfo({ phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-gray-50" />
                </div>
              </>
            )}
            {activeTab !== 'personal' && (
              <p className="text-sm text-gray-500 text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                {activeTab} form coming soon
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Panel & Topbar */}
      <div className="flex-1 bg-gray-100 relative overflow-auto flex flex-col items-center pt-8 print:block print:p-0 print:bg-white print:overflow-visible">
        
        {/* Action Bar */}
        <div className="w-[210mm] flex justify-end mb-4 print:hidden">
          <button 
            onClick={handleDownloadPdf}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>

        {/* Paper Container */}
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl rounded-sm scale-75 xl:scale-90 transform origin-top shrink-0 relative flex flex-col pt-12 px-12 pb-12 print:scale-100 print:shadow-none print:m-0">
           <div className="border-b-2 border-gray-800 pb-4 mb-6">
             <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{personalInfo.fullName || 'Your Name'}</h1>
             <p className="text-xl text-indigo-600 mt-1 font-medium">{personalInfo.jobTitle || 'Job Title'}</p>
           </div>
           
           <div className="grid grid-cols-3 gap-8 flex-1">
             <div className="col-span-2 space-y-6">
               <section>
                 <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 uppercase tracking-widest pb-1 mb-3">Experience</h2>
                 {experience.map(exp => (
                    <div key={exp.id} className="mb-4">
                      <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                      <p className="text-sm text-gray-500">{exp.company} • {exp.date}</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                 ))}
               </section>
             </div>
             
             <div className="space-y-6 border-l border-gray-100 pl-6">
                <section>
                 <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 uppercase tracking-widest pb-1 mb-3">Details</h2>
                 <div className="text-sm text-gray-600 space-y-2">
                   <p>{personalInfo.email}</p>
                   <p>{personalInfo.phone}</p>
                 </div>
               </section>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
