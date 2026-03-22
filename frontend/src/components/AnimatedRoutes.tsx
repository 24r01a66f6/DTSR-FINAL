import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Lazy loaded pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Builder = lazy(() => import('../pages/Builder'));
const TemplateSelector = lazy(() => import('../pages/TemplateSelector'));
const TemplateEditor = lazy(() => import('../pages/TemplateEditor'));
const ResumePrint = lazy(() => import('../pages/ResumePrint'));
import ProtectedRoute from './ProtectedRoute';
import AnimatedPage from './AnimatedPage';

// Context
import { ResumeProvider } from '../context/ResumeContext';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading your experience...</p>
        </div>
      }>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
          <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
          {/* Public print route for Puppeteer PDF generation - no auth required */}
          <Route path="/resume-print" element={<ResumePrint />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
            <Route path="/templates" element={<AnimatedPage><TemplateSelector /></AnimatedPage>} />
            <Route path="/template-editor/:id" element={<AnimatedPage><TemplateEditor /></AnimatedPage>} />
            <Route path="/builder" element={
              <ResumeProvider>
                <AnimatedPage className="h-full flex flex-col"><Builder /></AnimatedPage>
              </ResumeProvider>
            } />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
