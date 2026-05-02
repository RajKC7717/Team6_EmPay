import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import api from '../../api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    attendanceToday: 'Not Marked',
    leaveBalance: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    // Fetch dashboard summary data
    const fetchSummary = async () => {
      try {
        const attRes = await api.get('/attendance/status');
        
        let leaveBal = 0;
        try {
          const leaveRes = await api.get('/leave/balance');
          if (leaveRes.data.leaveBalances && leaveRes.data.leaveBalances.length > 0) {
            leaveBal = leaveRes.data.leaveBalances.reduce((acc: number, curr: any) => acc + curr.remaining_days, 0);
          }
        } catch (e) {
          console.error("Leave balance fetch err", e);
        }

        setStats({
          attendanceToday: attRes.data.statusType.replace('_', ' '),
          leaveBalance: leaveBal,
          pendingTasks: user?.role === 'admin' ? 3 : 0 // Mock for now
        });
      } catch (err) {
        console.error('Error fetching dashboard summary', err);
      }
    };

    fetchSummary();
  }, [user]);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.welcome-section', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    })
    .from('.stat-card', {
      y: 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2')
    .from('.recent-activity', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.2');
  }, { scope: dashboardRef });

  return (
    <div className="dashboard-container" ref={dashboardRef}>
      <div className="welcome-section">
        <h1>Welcome back, {user?.email?.split('@')[0]} 👋</h1>
        <p>Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card-minimal">
          <div className="stat-icon att-icon">🕒</div>
          <div className="stat-content">
            <h3>Attendance Today</h3>
            <p className="stat-value capitalize">{stats.attendanceToday}</p>
          </div>
        </div>
        
        <div className="stat-card card-minimal">
          <div className="stat-icon leave-icon">🏖️</div>
          <div className="stat-content">
            <h3>Leave Balance</h3>
            <p className="stat-value">{stats.leaveBalance} days</p>
          </div>
        </div>

        {user?.role !== 'employee' && (
          <div className="stat-card card-minimal">
            <div className="stat-icon task-icon">📋</div>
            <div className="stat-content">
              <h3>Pending Approvals</h3>
              <p className="stat-value">{stats.pendingTasks}</p>
            </div>
          </div>
        )}
      </div>

      <div className="recent-activity card-minimal">
        <div className="card-header">
          <h3>Recent Activity</h3>
        </div>
        <div className="card-body empty-state">
          <p>No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
