import React, { useMemo, useState } from 'react';
import api from '../api';
import '../styles/Modal.css';

interface Props {
  tempPassword: string;
  userEmail: string;
  onComplete: () => void;
}

const REQUIREMENTS = [
  { key: 'len',     label: 'Minimum 8 characters',  test: (p: string) => p.length >= 8 },
  { key: 'upper',   label: 'At least 1 uppercase',  test: (p: string) => /[A-Z]/.test(p) },
  { key: 'num',     label: 'At least 1 number',     test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'At least 1 special char (!@#$ etc.)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const FirstLoginModal: React.FC<Props> = ({ tempPassword, userEmail, onComplete }) => {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const checks = useMemo(() => REQUIREMENTS.map((r) => ({ ...r, ok: r.test(pw) })), [pw]);
  const allOk = checks.every((c) => c.ok);
  const matches = pw.length > 0 && pw === confirm;
  const notSameAsTemp = pw !== tempPassword;

  const submit = async () => {
    setErr(null);
    if (!allOk) { setErr('Password does not meet all requirements'); return; }
    if (!matches) { setErr('Passwords do not match'); return; }
    if (!notSameAsTemp) { setErr('You cannot reuse the temporary password'); return; }

    setBusy(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: tempPassword,
        newPassword: pw,
        confirmPassword: confirm,
      });
      // refresh stored user (first_login should now be false)
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        u.first_login = false;
        localStorage.setItem('user', JSON.stringify(u));
      }
      onComplete();
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Could not update password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 2000 }}>
      <div className="modal modal-md fade-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header" style={{ padding: '24px 28px 14px', borderBottom: 'none' }}>
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 }}>
              🔐
            </div>
            <h3 className="modal-title" style={{ fontSize: 20, marginBottom: 4 }}>Set your password</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Welcome to EmPay! For security, please set your own password before continuing.
            </p>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Signed in as </span><strong>{userEmail}</strong>
            </div>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: 8 }}>
          {err && <div className="alert alert-error">{err}</div>}

          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter new password"
                style={{ width: '100%', paddingRight: 44 }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: 12, fontWeight: 600 }}
              >
                {show ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
            />
            {confirm.length > 0 && !matches && (
              <span className="form-hint" style={{ color: 'var(--red-600)' }}>Passwords don't match</span>
            )}
          </div>

          <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Requirements</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {checks.map((c) => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: c.ok ? 'var(--green-600)' : 'var(--text-muted)' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: c.ok ? 'var(--green-500)' : 'var(--gray-200)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                    {c.ok ? '✓' : '·'}
                  </span>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '14px 28px 22px', justifyContent: 'stretch' }}>
          <button
            className="btn-primary btn-block btn-lg"
            disabled={busy || !allOk || !matches || !notSameAsTemp}
            onClick={submit}
          >
            {busy ? 'Setting password…' : 'Set Password & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginModal;
