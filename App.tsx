import React, { useState, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Booking from './pages/Booking';
import Memberships from './pages/Memberships';
import Shop from './pages/Shop';
import AdminPanel from './pages/AdminPanel';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TrainerSignUp from './pages/TrainerSignUp';
import { Loader2, AlertTriangle, X, Copy, ExternalLink, RefreshCw, Database } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_error: any): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="text-red-500 mb-6" size={64} />
          <h1 className="text-2xl font-black uppercase italic text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-8 max-w-sm">The application encountered an unexpected error. Try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-brand text-dark rounded-full font-black uppercase italic tracking-widest flex items-center gap-2">
            <RefreshCw size={18} /> Reload Site
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const SetupGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-black uppercase italic text-white mb-6 flex items-center gap-3">
          <Database className="text-brand" /> Supabase + Vercel Setup
        </h2>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Ensure these **Environment Variables** are added to your Vercel project settings:
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="bg-dark/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Variable Key 1</p>
              <code className="text-brand font-mono text-xs">VITE_SUPABASE_URL</code>
            </div>
            <button onClick={() => copyToClipboard('VITE_SUPABASE_URL')} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy size={14} className="text-slate-500 hover:text-white" />
            </button>
          </div>

          <div className="bg-dark/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Variable Key 2</p>
              <code className="text-brand font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>
            </div>
            <button onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY')} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy size={14} className="text-slate-500 hover:text-white" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-dark rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand transition-colors"
          >
            Open Vercel Dashboard <ExternalLink size={14} />
          </a>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 text-slate-400 rounded-xl font-black uppercase tracking-widest text-xs hover:text-white"
          >
            Dismiss
          </button>
        </div>
        
        <p className="text-center mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          Note: You must redeploy in Vercel after adding keys.
        </p>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isLoading, isDemoMode } = useAppContext();
  const [showGuide, setShowGuide] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <div className="spinner"></div>
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          ClassFit Varna
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-dark py-1.5 px-4 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} /> 
            Running in Local/Demo Mode. Supabase keys not detected.
          </div>
          <button 
            onClick={() => setShowGuide(true)}
            className="underline font-black hover:opacity-70 transition-opacity"
          >
            How to fix?
          </button>
        </div>
      )}

      {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/memberships" element={<Memberships />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<CustomerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/trainer-signup" element={<TrainerSignUp />} />
        </Routes>
      </Layout>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;