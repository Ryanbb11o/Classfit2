
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
import Desk from './pages/Desk';
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

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-3xl font-black uppercase italic text-white mb-4 tracking-tighter">Something went wrong</h1>
            <p className="text-slate-400 font-medium mb-10 text-sm leading-relaxed italic">
              The application encountered an unexpected error.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand text-dark rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/desk" element={<Desk />} />
              <Route path="/memberships" element={<Memberships />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/profile" element={<CustomerDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/trainer-signup" element={<TrainerSignUp />} />
              <Route path="/trainer" element={<TrainerDashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
