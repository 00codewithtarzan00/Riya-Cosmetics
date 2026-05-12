import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import AdminDashboard from './components/Admin/AdminDashboard';
import Login from './components/Admin/Login';
import NoticeHistory from './components/Home/NoticeHistory';
import Contact from './components/Home/Contact';
import About from './components/Home/About';
import ErrorBoundary from './components/ErrorBoundary';
import { subscribeToConfig } from './services/dataService';
import { auth, db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { StoreConfig } from './types';

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [config, setConfig] = useState<StoreConfig>({});

  useEffect(() => {
    // Check local session for immediate UI persistence
    const session = localStorage.getItem('adm_auth_session');
    if (session === 'true') {
      setIsAdmin(true);
    }

    // Sync Firebase Auth state for real security context
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user && user.email === "tarzanmaurya1234@gmail.com") {
        setIsAdmin(true);
        localStorage.setItem('adm_auth_session', 'true');
      } else if (!user && !localStorage.getItem('adm_auth_session')) {
        setIsAdmin(false);
      }
    });

    // Test Firestore Connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'config', 'global'));
        console.log("Firebase connection established successfully.");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firebase is offline. Please check your internet connection.");
        } else {
          console.error("Firebase connection error:", error);
        }
      }
    };
    testConnection();

    // Sync Global Config for logo throughout the app
    const unsubConfig = subscribeToConfig((data) => {
      setConfig(data);
      document.title = 'Riya Cosmetics';
      if (data.logoUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = data.logoUrl;
      }
    });

    return () => {
      unsubAuth();
      unsubConfig();
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adm_auth_session');
    setIsAdmin(false);
  };

  return (
    <div className="relative min-h-screen">
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home config={config} />} />
            <Route path="/about" element={<About config={config} />} />
            <Route path="/contact" element={<Contact config={config} />} />
            <Route path="/notices" element={<NoticeHistory config={config} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/admin/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </div>
  );
}
