
import React, { useState, ReactNode, Component } from 'react';
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
import TrainerDashboard from './pages/TrainerDashboard';
import Contact from './pages/Contact';
import { Loader2, AlertTriangle, X, Copy, ExternalLink, RefreshCw, Database } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
          Ensure these **Environment Variables** are added to your Vercel Project Settings to enable the database connection.
        </p>

        <div className="space-y-4 mb-8">
           <div className="bg-dark p-4 rounded-xl border border-white/5 flex items-center justify-between group">
              <code className="text-xs font-mono text-brand">VITE_SUPABASE_URL</code>
              <button onClick={() => copyToClipboard('VITE_SUPABASE_URL')} className="text-slate-500 hover:text-white"><Copy size={14} /></button>
           </div>
           <div className="bg-dark p-4 rounded-xl border border-white/5 flex items-center justify-between group">
              <code className="text-xs font-mono text-brand">VITE_SUPABASE_ANON_KEY</code>
              <button onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY')} className="text-slate-500 hover:text-white"><Copy size={14} /></button>
           </div>
        </div>

        <button onClick={onClose} className="w-full py-4 bg-white text-dark rounded-xl font-black uppercase tracking-widest hover:bg-brand transition-all">
           Got it
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
   const { isDemoMode } = useAppContext();
   const [showGuide, setShowGuide] = useState(false);

   return (
      <Layout>
        {/* Dev Banner if in Demo Mode */}
        {isDemoMode && (
            <div className="fixed bottom-4 right-4 z-50">
               <button 
                 onClick={() => setShowGuide(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-red-600 transition-all"
               >
                  <AlertTriangle size={12} /> Demo Mode
               </button>
            </div>
        )}
        
        {showGuide && <SetupGuide onClose={() => setShowGuide(false)} />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/memberships" element={<Memberships />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<CustomerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/trainer-signup" element={<TrainerSignUp />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
        </Routes>
      </Layout>
   );
}

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
