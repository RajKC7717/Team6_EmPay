import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEmployees from './pages/Admin/Employees';
import HRDashboard from './pages/HR/Dashboard';
import HREmployees from './pages/HR/Employees';
import HRAttendance from './pages/HR/Attendance';
import HRLeave from './pages/HR/Leave';
import PayrollDashboard from './pages/Payroll/Dashboard';
import PayrollPayrun from './pages/Payroll/Payrun';
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeAttendance from './pages/Employee/Attendance';
import EmployeeLeave from './pages/Employee/Leave';
import EmployeePayslips from './pages/Employee/Payslips';
import EmployeeProfile from './pages/Employee/Profile';
import PerformanceReviews from './pages/Performance/Reviews';
import PerformanceGoals from './pages/Performance/Goals';
import PolicyList from './pages/Policies/PolicyList';
import TaxDeclarations from './pages/Tax/Declarations';

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/performance" element={<PerformanceReviews />} />
        <Route path="/admin/policies" element={<PolicyList />} />
        <Route path="/admin/tax" element={<TaxDeclarations />} />

        {/* HR */}
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/hr/employees" element={<HREmployees />} />
        <Route path="/hr/attendance" element={<HRAttendance />} />
        <Route path="/hr/leave" element={<HRLeave />} />
        <Route path="/hr/performance" element={<PerformanceReviews />} />
        <Route path="/hr/policies" element={<PolicyList />} />

        {/* Payroll */}
        <Route path="/payroll" element={<PayrollDashboard />} />
        <Route path="/payroll/payrun" element={<PayrollPayrun />} />
        <Route path="/payroll/tax" element={<TaxDeclarations />} />
        <Route path="/payroll/policies" element={<PolicyList />} />

        {/* Employee */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/leave" element={<EmployeeLeave />} />
        <Route path="/employee/payslips" element={<EmployeePayslips />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route path="/employee/tax" element={<TaxDeclarations />} />
        <Route path="/employee/performance" element={<PerformanceReviews />} />
        <Route path="/employee/policies" element={<PolicyList />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
