import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, LogOut, FileBadge2, Clock, MoreVertical, X, LayoutTemplate, PenTool, Trash2, Loader2, Star } from 'lucide-react';
import api from '../utils/api';

interface Resume {
  _id: string;
  title: string;
  updatedAt: string;
  score?: number;
  layout?: any[];
  templateData?: any;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/resume');
      // Handle either array or paginated object
      if (Array.isArray(data)) {
        setResumes(data);
      } else if (data && data.resumes) {
        setResumes(data.resumes);
      }
    } catch (err) {
      console.error('Failed to fetch resumes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteResume = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await api.delete(`/resume/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete resume', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="absolute top-40 left-0 -ml-40 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-indigo-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-sm">
                <FileBadge2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-900 to-purple-800">
                ResumeBuilder
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                  <span className="text-indigo-800 font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-slate-700 font-medium hidden sm:block">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Your Resumes</h2>
            <p className="mt-1 text-sm text-slate-500">Manage and create your professional profiles</p>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {/* Create New Card */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group w-full h-72 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            >
              <div className="h-16 w-16 mb-4 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Plus className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-indigo-900">Create New</h3>
              <p className="mt-1 text-sm text-indigo-600/70">Pick a template or start blank</p>
            </button>
          </motion.div>

          {/* Existing Resumes */}
          {resumes.map((resume) => (
            <motion.div key={resume._id} variants={itemVariants}>
              <div className="group relative w-full h-72 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => handleDeleteResume(e, resume._id)}
                    className="p-2 -m-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div 
                  className="h-40 bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-center overflow-hidden relative"
                  onClick={() => navigate(resume.templateData ? `/template-editor/modern` : '/builder', { state: { resumeId: resume._id } })}
                >
                  {/* Visual Representation of Resume */}
                  <div className="w-24 h-32 bg-white shadow-md border border-slate-200 p-2 flex flex-col gap-1 rounded-sm transform group-hover:scale-105 transition-transform duration-300">
                    <div className="h-1.5 w-full bg-slate-200 rounded-sm"></div>
                    <div className="h-1 w-3/4 bg-slate-100 rounded-sm"></div>
                    <div className="mt-2 h-0.5 w-full bg-indigo-50 rounded-sm"></div>
                    <div className="h-16 w-full bg-slate-50 rounded-sm mt-1"></div>
                  </div>

                  {resume.score !== undefined && (
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-indigo-100 shadow-sm flex items-center space-x-1">
                      <Star className={`h-3 w-3 ${resume.score > 80 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      <span className="text-[10px] font-bold text-slate-700">{resume.score}%</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                  <div onClick={() => navigate(resume.templateData ? `/template-editor/modern` : '/builder', { state: { resumeId: resume._id } })}>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tight">{resume.title}</h3>
                    <div className="flex items-center text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-widest">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <div className={`h-2 w-2 rounded-full ${resume.templateData ? 'bg-indigo-400' : 'bg-purple-400'}`}></div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{resume.templateData ? 'Standard' : 'Freeform'}</span>
                    </div>
                    <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">Edit</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && resumes.length === 0 && (
            [1, 2, 3].map(i => (
              <div key={i} className="w-full h-72 rounded-2xl bg-white border border-slate-100 animate-pulse flex flex-col">
                <div className="h-40 bg-slate-50"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                </div>
              </div>
            ))
          )}

          {!isLoading && resumes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
               <FileText className="h-12 w-12 mb-4 opacity-20" />
               <p className="text-sm font-medium">No resumes found. Create your first one!</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Creation Flow Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="relative p-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">How would you like to build your resume?</h2>
                <p className="text-slate-500 mb-8">Choose a starting point. You can always switch later.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Template Choice */}
                  <button 
                    onClick={() => navigate('/templates')}
                    className="group text-left p-6 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col"
                  >
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <LayoutTemplate className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Use a Template</h3>
                    <p className="text-sm text-slate-500 grow">
                      Select from professionally designed, ATS-friendly templates. Just fill in your details and we'll format it perfectly.
                    </p>
                  </button>

                  {/* Custom Choice */}
                  <button 
                    onClick={() => navigate('/builder')}
                    className="group text-left p-6 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col"
                  >
                    <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <PenTool className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Start from Scratch</h3>
                    <p className="text-sm text-slate-500 grow">
                      Open the advanced drag-and-drop canvas. You have complete control over every pixel, text block, and layout grid.
                    </p>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
