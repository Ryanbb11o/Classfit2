
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
import NotFound from './pages/NotFound'; // Import the new 404 page
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
      return <NotFound />; // Use the aesthetic 404 for catastrophic errors too
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
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
