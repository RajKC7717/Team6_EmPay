import React, { useState } from 'react';
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

const EmployeeFormModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [form, setForm] = useState<typeof blank>(blank);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeNote, setResumeNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const submit = async () => {
    setError(null);
    if (!form.firstName || !form.lastName || !form.email || !form.department || !form.designation || !form.dateOfJoining || !form.basicWage) {
      setError('Please fill all required fields');
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
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'choose') {
    return (
      <Modal open onClose={onClose} title="Add Employee" size="md">
        <p style={{ marginBottom: 18, color: 'var(--text-muted)', fontSize: 14 }}>
          Choose how you'd like to onboard this employee. Login ID and a temporary password will be auto-generated and emailed.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'grid', gap: 12 }}>
          <label
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 16,
              border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer',
              background: resumeBusy ? 'var(--gray-50)' : 'var(--surface)',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>↑</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Upload a resume</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                {resumeBusy ? 'Parsing resume…' : 'PDF only — name, email, phone, designation, address auto-filled'}
              </div>
            </div>
            <input
              type="file"
              accept=".pdf"
              hidden
              disabled={resumeBusy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onResume(f); }}
            />
          </label>

          <button
            type="button"
            onClick={() => setStep('form')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 16,
              border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer',
              background: 'var(--surface)', textAlign: 'left',
            }}
          >
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

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Employee — Details"
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Employee & Email Credentials'}
          </button>
        </>
      }
    >
      {resumeNote && <div className="alert alert-success">{resumeNote}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <h4 style={{ marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal</h4>
      <div className="form-row">
        <div className="form-group">
          <label>First Name <span className="required">*</span></label>
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Last Name <span className="required">*</span></label>
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Email <span className="required">*</span></label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Emergency Contact Phone</label>
          <input value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
        </div>
      </div>

      <h4 style={{ marginTop: 18, marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Department <span className="required">*</span></label>
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" />
        </div>
        <div className="form-group">
          <label>Designation <span className="required">*</span></label>
          <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Software Engineer" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date of Joining <span className="required">*</span></label>
          <input type="date" value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} />
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

      <h4 style={{ marginTop: 18, marginBottom: 14, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compensation</h4>
      <div className="form-row">
        <div className="form-group">
          <label>Basic Monthly Wage (₹) <span className="required">*</span></label>
          <input type="number" min={0} value={form.basicWage} onChange={(e) => setForm({ ...form, basicWage: e.target.value })} />
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
          <label>Bank Account Number</label>
          <input value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Bank IFSC Code</label>
        <input value={form.bankIfscCode} onChange={(e) => setForm({ ...form, bankIfscCode: e.target.value.toUpperCase() })} />
      </div>

      <div className="policy-notice">
        ⓘ A login ID like <strong>OIJODO20260001</strong> and a temporary password will be auto-generated and emailed to the employee.
      </div>
    </Modal>
  );
};

export default EmployeeFormModal;
