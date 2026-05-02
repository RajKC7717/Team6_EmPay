import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getUser } from '../api';
import '../styles/Dashboard.css';

interface Props {
  title?: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ title, children }) => {
  const user = getUser();
  const role = user?.role || 'employee';

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <main className="main-content">
        <Topbar title={title} />
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
