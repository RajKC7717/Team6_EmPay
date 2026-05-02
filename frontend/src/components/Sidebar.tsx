import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

type Role = 'admin' | 'hr_officer' | 'payroll_officer' | 'employee';

interface NavLink {
  to: string;
  label: string;
  icon: string;
}

const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '◧' },
    { to: '/admin/employees', label: 'Employees', icon: '◔' },
    { to: '/admin/performance', label: 'Performance', icon: '◑' },
    { to: '/admin/policies', label: 'Policies', icon: '◐' },
    { to: '/payroll/payrun', label: 'Payroll', icon: '◓' },
    { to: '/admin/tax', label: 'Tax Approvals', icon: '◒' },
  ],
  hr_officer: [
    { to: '/hr', label: 'Dashboard', icon: '◧' },
    { to: '/hr/employees', label: 'Employees', icon: '◔' },
    { to: '/hr/attendance', label: 'Attendance', icon: '◑' },
    { to: '/hr/leave', label: 'Leave Requests', icon: '◐' },
    { to: '/hr/performance', label: 'Performance', icon: '◓' },
    { to: '/hr/policies', label: 'Policies', icon: '◒' },
  ],
  payroll_officer: [
    { to: '/payroll', label: 'Dashboard', icon: '◧' },
    { to: '/payroll/payrun', label: 'Payroll Runs', icon: '◓' },
    { to: '/payroll/tax', label: 'Tax Approvals', icon: '◒' },
    { to: '/payroll/policies', label: 'Policies', icon: '◐' },
  ],
  employee: [
    { to: '/employee', label: 'Dashboard', icon: '◧' },
    { to: '/employee/attendance', label: 'My Attendance', icon: '◑' },
    { to: '/employee/leave', label: 'Leave Requests', icon: '◐' },
    { to: '/employee/payslips', label: 'Payslips', icon: '◓' },
    { to: '/employee/tax', label: 'Income Tax', icon: '◒' },
    { to: '/employee/performance', label: 'Performance', icon: '◔' },
    { to: '/employee/policies', label: 'Policies', icon: '◧' },
    { to: '/employee/profile', label: 'My Profile', icon: '◐' },
  ],
};

interface Props { role: Role; }

const Sidebar: React.FC<Props> = ({ role }) => {
  const location = useLocation();
  const links = NAV_BY_ROLE[role] || [];

  const roleLabel = {
    admin: 'Administrator',
    hr_officer: 'HR Officer',
    payroll_officer: 'Payroll Officer',
    employee: 'Employee',
  }[role];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-mark">E</div>
          <div>
            <div className="sidebar-logo-name">EmPay</div>
            <div className="sidebar-logo-sub">{roleLabel}</div>
          </div>
        </Link>
      </div>
      <nav className="sidebar-nav">
        {links.map((link, i) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-nav-item ${active ? 'active' : ''} fade-up delay-${(i % 5) + 1}`}
            >
              <span className="sidebar-nav-icon">{link.icon}</span>
              <span>{link.label}</span>
              {active && <span className="sidebar-nav-indicator" />}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-version">EmPay HRMS v1.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
