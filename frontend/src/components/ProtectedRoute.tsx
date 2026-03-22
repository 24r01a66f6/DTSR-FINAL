import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center space-y-4 bg-white p-8 rounded-2xl shadow-xl border border-indigo-50"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-100 rounded-full blur animate-ping opacity-50"></div>
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin relative z-10" />
          </div>
          <p className="text-slate-600 font-medium tracking-wide">Authenticating...</p>
        </motion.div>
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
