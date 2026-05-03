import React, { useState, useCallback } from 'react';
import api from '../api';
import Modal from './Modal';

interface CreatedCreds {
  loginId: string;
  password: string;
  email: string;
  name: string;
}

interface Props {
  onClose: () => void;
  onCreated: (creds: CreatedCreds | null) => void;
}

const blank = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  department: '',
  designation: '',
  dateOfJoining: new Date().toISOString().slice(0, 10),
  employmentType: 'full_time',
  basicWage: '',
  pfApplicable: true,
  professionalTaxApplicable: true,
  bankAccountNumber: '',
  bankIfscCode: '',
};

type FieldErrors = Record<string, string>;

/* ── Real-time field validator ─────────────────────────── */
const validateField = (name: string, value: string): string => {
  switch (name) {
    case 'firstName':
      if (!value) return 'First name is required';
      if (value.length < 2) return 'Min 2 characters';
      return '';
    case 'lastName':
      if (!value) return 'Last name is required';
      if (value.length < 2) return 'Min 2 characters';
      return '';
    case 'email':
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email (e.g. john@company.com)';
      return '';
    case 'phone':
      if (!value) return '';
      if (!/^\d*$/.test(value)) return 'Only digits allowed';
      if (value.length !== 10) return 'Must be exactly 10 digits';
      return '';
    case 'emergencyContactPhone':
      if (!value) return '';
      if (!/^\d*$/.test(value)) return 'Only digits allowed';
      if (value.length !== 10) return 'Must be exactly 10 digits';
      return '';
    case 'department':
      if (!value) return 'Department is required';
      return '';
    case 'designation':
      if (!value) return 'Designation is required';
      return '';
    case 'dateOfJoining':
      if (!value) return 'Date of joining is required';
      return '';
    case 'basicWage':
      if (!value) return 'Basic wage is required';
      if (isNaN(Number(value))) return 'Must be a number';
      if (Number(value) < 2000) return 'Minimum ₹2,000';
      return '';
    case 'bankAccountNumber':
      if (!value) return '';
      if (!/^\d*$/.test(value)) return 'Only digits allowed';
      if (value.length < 9 || value.length > 18) return 'Must be 9-18 digits';
      return '';
    case 'bankIfscCode':
      if (!value) return '';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) return 'Format: HDFC0001234 (11 chars)';
      return '';
    default:
      return '';
  }
};

const EmployeeFormModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [form, setForm] = useState<typeof blank>(blank);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeNote, setResumeNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const onResume = async (file: File) => {
    setResumeBusy(true);
    setResumeNote(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const r = await api.post('/employees/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const d = r.data.data || {};
      setForm((prev) => ({
        ...prev,
        firstName: d.firstName || prev.firstName,
        lastName: d.lastName || prev.lastName,
        email: d.email || prev.email,
        phone: d.phone || prev.phone,
        designation: d.designation || prev.designation,
        address: d.address || prev.address,
      }));
      setResumeNote('✓ Resume parsed. Review and complete the missing fields.');
      setStep('form');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not parse resume');
    } finally {
      setResumeBusy(false);
    }
  };

  /* update a field + validate in real-time */
  const updateField = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  }, []);

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, (form as any)[name]);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  }, [form]);

  const validateAll = (): boolean => {
    const requiredFields = ['firstName', 'lastName', 'email', 'department', 'designation', 'dateOfJoining', 'basicWage'];
    const optionalValidated = ['phone', 'emergencyContactPhone', 'bankAccountNumber', 'bankIfscCode'];
    const allFields = [...requiredFields, ...optionalValidated];
    const errs: FieldErrors = {};
    const nowTouched: Record<string, boolean> = {};
    for (const f of allFields) {
      nowTouched[f] = true;
      const err = validateField(f, (form as any)[f]);
      if (err) errs[f] = err;
    }
    setTouched((prev) => ({ ...prev, ...nowTouched }));
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    setError(null);
    if (!validateAll()) {
      setError('Please fix the highlighted fields below');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        basicWage: Number(form.basicWage),
      };
      Object.keys(payload).forEach((k) => { if (payload[k] === '' || payload[k] === null) delete payload[k]; });
      const r = await api.post('/employees', payload);
      onCreated({
        loginId: r.data.employee?.loginId || r.data.loginId || '—',
        password: r.data.temporaryPassword || r.data.employee?.temporaryPassword || '—',
        email: form.email,
        name: `${form.firstName} ${form.lastName}`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create employee';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* Styles */
  const inputStyle = (name: string): React.CSSProperties => {
    if (!touched[name]) return {};
    if (fieldErrors[name]) return { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)', background: '#fef2f2' };
    return { borderColor: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.12)' };
  };

  const renderHint = (name: string) => {
    if (!touched[name] || !fieldErrors[name]) return null;
    return <span style={{ color: '#ef4444', fontSize: 11.5, marginTop: 4, display: 'block', fontWeight: 500 }}>⚠ {fieldErrors[name]}</span>;
  };

  /* ── Step 1: Choose method ─────────────────────────── */
  if (step === 'choose') {
    return (
      <Modal open onClose={onClose} title="Add Employee" size="md">
        <p style={{ marginBottom: 18, color: 'var(--text-muted)', fontSize: 14 }}>
          Choose how you'd like to onboard this employee. Login ID and a temporary password will be auto-generated and emailed.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', background: resumeBusy ? 'var(--gray-50)' : 'var(--surface)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>↑</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Upload a resume</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{resumeBusy ? 'Parsing resume…' : 'PDF only — name, email, phone auto-filled'}</div>
            </div>
            <input type="file" accept=".pdf" hidden disabled={resumeBusy} onChange={(e) => { const f = e.target.files?.[0]; if (f) onResume(f); }} />
          </label>
          <button type="button" onClick={() => setStep('form')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', background: 'var(--surface)', textAlign: 'left' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✎</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Fill manually</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Enter details yourself</div>
            </div>
          </button>
        </div>
      </Modal>
    );
  }

  /* ── Step 2: The form ─────────────────────────── */
  return (
    <Modal open onClose={onClose} title="Add Employee — Details" size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={submitting}>{submitting ? 'Creating…' : 'Create Employee & Email Credentials'}</button>
      </>}
    >
      {resumeNote && <div className="alert alert-success">{resumeNote}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ── PERSONAL ── */}
      <h4 style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal</h4>
      <div className="form-row">
        <div className="form-group">
          <label>First Name <span className="required">*</span></label>
          <input style={inputStyle('firstName')} placeholder="e.g. John" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} onBlur={() => handleBlur('firstName')} />
          {renderHint('firstName')}
        </div>
        <div className="form-group">
          <label>Last Name <span className="required">*</span></label>
          <input style={inputStyle('lastName')} placeholder="e.g. Doe" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} onBlur={() => handleBlur('lastName')} />
          {renderHint('lastName')}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Email <span className="required">*</span></label>
          <input style={inputStyle('email')} type="email" placeholder="e.g. john@company.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} onBlur={() => handleBlur('email')} />
          {renderHint('email')}
        </div>
        <div className="form-group">
          <label>Phone <span style={{ fontSize: 11, color: '#94a3b8' }}>(10 digits)</span></label>
          <input style={inputStyle('phone')} placeholder="e.g. 9876543210" maxLength={10} value={form.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={() => handleBlur('phone')} />
          {renderHint('phone')}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date of Birth</label>
          <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Address</label>
        <textarea placeholder="e.g. 123 Main Street, Pune, Maharashtra" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input placeholder="e.g. Ramesh Kumar" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Emergency Contact Phone <span style={{ fontSize: 11, color: '#94a3b8' }}>(10 digits)</span></label>
          <input style={inputStyle('emergencyContactPhone')} placeholder="e.g. 9876543210" maxLength={10} value={form.emergencyContactPhone} onChange={(e) => updateField('emergencyContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={() => handleBlur('emergencyContactPhone')} />
          {renderHint('emergencyContactPhone')}
        </div>
      </div>

      {/* ── JOB ── */}
      <h4 style={{ marginTop: 18, marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Department <span className="required">*</span></label>
          <input style={inputStyle('department')} placeholder="e.g. Engineering" value={form.department} onChange={(e) => updateField('department', e.target.value)} onBlur={() => handleBlur('department')} />
          {renderHint('department')}
        </div>
        <div className="form-group">
          <label>Designation <span className="required">*</span></label>
          <input style={inputStyle('designation')} placeholder="e.g. Software Engineer" value={form.designation} onChange={(e) => updateField('designation', e.target.value)} onBlur={() => handleBlur('designation')} />
          {renderHint('designation')}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date of Joining <span className="required">*</span></label>
          <input style={inputStyle('dateOfJoining')} type="date" value={form.dateOfJoining} onChange={(e) => updateField('dateOfJoining', e.target.value)} onBlur={() => handleBlur('dateOfJoining')} />
          {renderHint('dateOfJoining')}
        </div>
        <div className="form-group">
          <label>Employment Type</label>
          <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
      </div>

      {/* ── COMPENSATION ── */}
      <h4 style={{ marginTop: 18, marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compensation</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Basic Monthly Wage (₹) <span className="required">*</span> <span style={{ fontSize: 11, color: '#94a3b8' }}>(min ₹2,000)</span></label>
          <input style={inputStyle('basicWage')} type="number" min={2000} placeholder="e.g. 50000" value={form.basicWage} onChange={(e) => updateField('basicWage', e.target.value)} onBlur={() => handleBlur('basicWage')} />
          {renderHint('basicWage')}
        </div>
        <div className="form-group">
          <label>PF Applicable</label>
          <select value={form.pfApplicable ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, pfApplicable: e.target.value === 'yes' })}>
            <option value="yes">Yes (12% deduction)</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Professional Tax</label>
          <select value={form.professionalTaxApplicable ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, professionalTaxApplicable: e.target.value === 'yes' })}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Bank Account Number <span style={{ fontSize: 11, color: '#94a3b8' }}>(9-18 digits)</span></label>
          <input style={inputStyle('bankAccountNumber')} placeholder="e.g. 1234567890123456" maxLength={18} value={form.bankAccountNumber} onChange={(e) => updateField('bankAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))} onBlur={() => handleBlur('bankAccountNumber')} />
          {renderHint('bankAccountNumber')}
        </div>
      </div>
      <div className="form-group">
        <label>Bank IFSC Code <span style={{ fontSize: 11, color: '#94a3b8' }}>(e.g. HDFC0001234)</span></label>
        <input style={inputStyle('bankIfscCode')} placeholder="e.g. HDFC0001234" maxLength={11} value={form.bankIfscCode} onChange={(e) => updateField('bankIfscCode', e.target.value.toUpperCase().slice(0, 11))} onBlur={() => handleBlur('bankIfscCode')} />
        {renderHint('bankIfscCode')}
      </div>

      <div className="policy-notice">
        ⓘ A login ID like <strong>OIJODO20260001</strong> and a temporary password will be auto-generated and emailed to the employee.
      </div>
    </Modal>
  );
};

export default EmployeeFormModal;
