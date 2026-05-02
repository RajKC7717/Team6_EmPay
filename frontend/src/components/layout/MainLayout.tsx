import React, { useRef } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Fade in the main content area when layout mounts
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <Topbar />
        <main className="main-area" ref={mainRef}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
