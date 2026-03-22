import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, Plus } from 'lucide-react';

import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ResumeBuilder</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Hello, {user?.name}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <Link to="/builder" className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Create New Resume
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for resumes */}
          <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="p-6 h-48 flex items-center justify-center bg-gray-50/50 group-hover:bg-indigo-50/30 transition-colors">
              <FileText className="h-12 w-12 text-gray-300 group-hover:text-indigo-300 transition-colors" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Software Engineer</h3>
              <p className="text-sm text-gray-500">Updated 2 days ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
