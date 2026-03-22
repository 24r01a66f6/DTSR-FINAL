import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const availableTemplates = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean lines and a clear hierarchy. Perfect for tech and corporate roles.',
    color: 'indigo',
    thumbnail: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    description: 'Stripped down to the essentials. Lets your experience do the talking.',
    color: 'emerald',
    thumbnail: 'bg-emerald-50 border-emerald-200'
  },
  {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Stand out from the crowd with bold typography and section blocks.',
    color: 'rose',
    thumbnail: 'bg-rose-50 border-rose-200'
  }
];

export default function TemplateSelector() {
  const navigate = useNavigate();

  const handleSelectTemplate = (templateId: string) => {
    // Navigate strictly to the template-specific editor
    navigate(`/template-editor/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="h-16 flex-none bg-white border-b border-slate-200 shadow-sm z-20 flex items-center px-4 sm:px-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-indigo-50 mr-2 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Choose a Template
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-500"
          >
            Start with a professionally crafted design. You can completely customize it or break it apart later.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {availableTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all overflow-hidden cursor-pointer"
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Thumbnail Placeholder */}
              <div className={`h-64 ${template.thumbnail} border-b p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
                <div className="w-3/4 h-full bg-white shadow-md rounded-t-sm border border-slate-200 p-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                  <div className={`h-3 w-1/3 bg-${template.color}-200 rounded-sm mb-2`}></div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-sm mb-1"></div>
                  <div className="h-1.5 w-3/4 bg-slate-100 rounded-sm mb-3"></div>
                  
                  <div className={`h-2 w-1/4 bg-${template.color}-100 rounded-sm mb-1.5`}></div>
                  <div className="h-1 w-full bg-slate-100 rounded-sm mb-1"></div>
                  <div className="h-1 w-full bg-slate-100 rounded-sm mb-1"></div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-indigo-600 px-6 py-2.5 rounded-full font-bold shadow-lg flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Use Template
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
                <p className="text-slate-500 text-sm flex-1">{template.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
