import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiUsers, FiClock, FiCalendar, 
  FiTarget, FiFileText, FiDollarSign 
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.from('.sidebar-nav-item', {
      x: -20,
      opacity: 0,
      stagger: 0.05,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.2
    });
  }, { scope: sidebarRef });

  return (
    <aside className="sidebar" ref={sidebarRef}>
      <div className="sidebar-logo">
        <h2>EmPay</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FiHome className="nav-icon" /> Dashboard
        </NavLink>
        
        {user?.role !== 'employee' && (
          <NavLink to="/employees" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <FiUsers className="nav-icon" /> Employees
          </NavLink>
        )}
        
        <NavLink to="/attendance" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FiClock className="nav-icon" /> Attendance
        </NavLink>
        
        <NavLink to="/leave" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FiCalendar className="nav-icon" /> Leave
        </NavLink>
        
        <NavLink to="/performance" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FiTarget className="nav-icon" /> Performance
        </NavLink>
        
        <NavLink to="/policies" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FiFileText className="nav-icon" /> Policies
        </NavLink>
        
        <NavLink to="/tax" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <FiDollarSign className="nav-icon" /> Payroll & Tax
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
