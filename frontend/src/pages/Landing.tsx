import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="ln-nav">
        <div className="ln-container ln-nav-inner">
          <Link to="/" className="ln-logo">
            <div className="ln-logo-mark">E</div>
            <span>EmPay</span>
          </Link>
          <ul className="ln-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#workflow">Workflow</a></li>
            <li><a href="#demo">Demo</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <div className="ln-nav-actions">
            <button className="btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="ln-hero">
        <div className="ln-hero-bg">
          <div className="ln-blob ln-blob-1" />
          <div className="ln-blob ln-blob-2" />
          <div className="ln-grid-bg" />
        </div>

        <div className="ln-container ln-hero-inner">
          <div className="ln-hero-text">
            <span className="ln-eyebrow fade-up">A modern HRMS · Built for India</span>
            <h1 className="ln-hero-title fade-up delay-1">
              The HR &<br />
              Payroll OS<br />
              <span className="ln-hero-accent">for smarter teams.</span>
            </h1>
            <p className="ln-hero-desc fade-up delay-2">
              EmPay unifies people, payroll, attendance, performance, taxes, and policies — in one
              elegant workspace. Onboard in seconds. Pay in clicks. Comply by default.
            </p>
            <div className="ln-hero-cta fade-up delay-3">
              <button className="btn-primary btn-lg" onClick={() => navigate('/register')}>
                Start Free Trial →
              </button>
              <button className="btn-outline btn-lg" onClick={() => setVideoOpen(true)}>
                ▷ Watch Demo Video
              </button>
            </div>
            <div className="ln-hero-stats fade-up delay-4">
              <div><span>10K+</span><small>Companies</small></div>
              <div><span>500K+</span><small>Employees</small></div>
              <div><span>99.9%</span><small>Uptime</small></div>
            </div>
          </div>

          <div className="ln-hero-visual fade-up delay-3">
            <div className="ln-mockup">
              <div className="ln-mockup-bar">
                <span /><span /><span />
                <em>empay.app · /admin</em>
              </div>
              <div className="ln-mockup-body">
                <div className="ln-mockup-side">
                  <div className="ln-mockup-side-item active" />
                  <div className="ln-mockup-side-item" />
                  <div className="ln-mockup-side-item" />
                  <div className="ln-mockup-side-item" />
                  <div className="ln-mockup-side-item" />
                </div>
                <div className="ln-mockup-main">
                  <div className="ln-mockup-stats">
                    <div className="ln-mockup-stat"><b>148</b><span>Employees</span></div>
                    <div className="ln-mockup-stat green"><b>92%</b><span>Present</span></div>
                    <div className="ln-mockup-stat amber"><b>7</b><span>Pending</span></div>
                  </div>
                  <div className="ln-mockup-chart">
                    {[40, 55, 38, 70, 60, 82, 75, 90, 68, 85, 72, 95].map((h, i) => (
                      <div key={i} className="ln-mockup-bar-item" style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="ln-mockup-glow" />
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="ln-section">
        <div className="ln-container">
          <div className="ln-section-head">
            <span className="ln-eyebrow">Capabilities</span>
            <h2>Built for every role in your team</h2>
            <p>Admin, HR, Payroll, and Employees — each with their own thoughtful surface.</p>
          </div>
          <div className="ln-features">
            <div className="ln-feature">
              <div className="ln-feature-icon" style={{ background: '#F3EAF1', color: '#714B67' }}>◔</div>
              <h3>Auto-Generated Login IDs</h3>
              <p>Login IDs in the format <code>OIJODO20220001</code> — company code + name initials + year + serial. Created and emailed automatically.</p>
            </div>
            <div className="ln-feature">
              <div className="ln-feature-icon" style={{ background: '#E0F4F3', color: '#017E84' }}>◑</div>
              <h3>One-Click Attendance</h3>
              <p>Top-right pill turns green when checked in, shows a plane on leave, and red when uninformed. No forms, no fuss.</p>
            </div>
            <div className="ln-feature">
              <div className="ln-feature-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>◐</div>
              <h3>Resume Auto-Extraction</h3>
              <p>Drop a resume PDF — EmPay parses name, email, phone, and skills. Onboarding goes from 15 minutes to 30 seconds.</p>
            </div>
            <div className="ln-feature">
              <div className="ln-feature-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>◓</div>
              <h3>Performance Reviews</h3>
              <p>HR runs cycles with ratings, strengths, growth areas, and goal tracking — visible to the right people.</p>
            </div>
            <div className="ln-feature">
              <div className="ln-feature-icon" style={{ background: '#F0FDF4' , color: '#16A34A' }}>◒</div>
              <h3>Income Tax Engine</h3>
              <p>Slab-based annual tax with HRA, 80C, 80D, home loan declarations. Monthly TDS computed in real time.</p>
            </div>
            <div className="ln-feature">
              <div className="ln-feature-icon" style={{ background: '#FEF2F2', color: '#DC2626' }}>◧</div>
              <h3>Policies in Context</h3>
              <p>Attendance, leave, tax, conduct — surfaced where they matter, searchable, version-tracked by Admin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow / How it works */}
      <section id="workflow" className="ln-section ln-workflow-section">
        <div className="ln-container">
          <div className="ln-section-head">
            <span className="ln-eyebrow">Your day on EmPay</span>
            <h2>From check-in to payslip — five clicks, four people</h2>
            <p>Each role has a simple loop. Together they form the full HR workflow.</p>
          </div>

          <div className="ln-workflow">
            {[
              { n: 1, title: 'Admin registers the company', desc: 'Sets a 2-letter code (e.g., OI). Becomes the only person with full access.' },
              { n: 2, title: 'HR adds employees', desc: 'Manually or via resume upload. Login IDs and welcome emails go out automatically.' },
              { n: 3, title: 'Employees check in', desc: 'One click in the top-right. Apply for leave. View payslips, taxes, performance.' },
              { n: 4, title: 'HR approves leaves', desc: 'Pending queue shows everything. Approve or reject with a reason — payroll never touches this.' },
              { n: 5, title: 'Payroll runs salaries', desc: 'Computes PF, professional tax, and net pay. Generates payslips. Marks the run as paid.' },
            ].map((s) => (
              <div key={s.n} className="ln-workflow-step">
                <div className="ln-workflow-num">{s.n}</div>
                <div className="ln-workflow-text">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video */}
      <section id="demo" className="ln-section ln-demo">
        <div className="ln-container">
          <div className="ln-section-head light">
            <span className="ln-eyebrow">Watch the demo</span>
            <h2>See EmPay run end-to-end in 90 seconds</h2>
            <p>From admin registration to first payslip — everything that matters.</p>
          </div>

          <button className="ln-video-card" onClick={() => setVideoOpen(true)}>
            <div className="ln-video-thumb">
              <div className="ln-video-play">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="ln-video-time">1:34</span>
            </div>
            <div className="ln-video-meta">
              <h4>EmPay HRMS — Full Walkthrough</h4>
              <p>Admin · HR · Payroll · Employee perspectives in one demo.</p>
            </div>
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="ln-section">
        <div className="ln-container">
          <div className="ln-section-head">
            <span className="ln-eyebrow">Pricing</span>
            <h2>Simple plans. No hidden fees.</h2>
            <p>Pay per company, not per user. Switch plans anytime.</p>
          </div>
          <div className="ln-pricing">
            <div className="ln-price-card">
              <h3>Starter</h3>
              <p className="ln-price-desc">For teams of up to 25</p>
              <div className="ln-price"><span>₹</span>2,499<small>/month</small></div>
              <ul>
                <li>Up to 25 employees</li>
                <li>Attendance & leave</li>
                <li>Basic payroll</li>
                <li>Email support</li>
              </ul>
              <button className="btn-outline btn-block" onClick={() => navigate('/register')}>Start free</button>
            </div>
            <div className="ln-price-card featured">
              <span className="ln-price-badge">Most popular</span>
              <h3>Growth</h3>
              <p className="ln-price-desc">For SMEs scaling fast</p>
              <div className="ln-price"><span>₹</span>7,999<small>/month</small></div>
              <ul>
                <li>Up to 100 employees</li>
                <li>Performance management</li>
                <li>Resume auto-parsing</li>
                <li>Tax declarations & TDS</li>
                <li>Priority support</li>
              </ul>
              <button className="btn-primary btn-block" onClick={() => navigate('/register')}>Start free</button>
            </div>
            <div className="ln-price-card">
              <h3>Enterprise</h3>
              <p className="ln-price-desc">For large organizations</p>
              <div className="ln-price-custom">Custom</div>
              <ul>
                <li>Unlimited employees</li>
                <li>SAML SSO + audit logs</li>
                <li>Custom integrations</li>
                <li>Dedicated CSM</li>
              </ul>
              <button className="btn-outline btn-block" onClick={() => navigate('/login')}>Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ln-section ln-cta">
        <div className="ln-container">
          <div className="ln-cta-card">
            <h2>Ready to transform HR at your company?</h2>
            <p>Set up in under 2 minutes. Cancel anytime.</p>
            <div className="ln-cta-actions">
              <button className="btn-primary btn-lg" onClick={() => navigate('/register')}>Get Started Free</button>
              <button className="btn-secondary btn-lg" onClick={() => setVideoOpen(true)}>Watch Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ln-footer">
        <div className="ln-container">
          <div className="ln-footer-grid">
            <div className="ln-footer-brand">
              <div className="ln-logo">
                <div className="ln-logo-mark">E</div>
                <span>EmPay HRMS</span>
              </div>
              <p>Smart HR & payroll, simplified.</p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#demo">Demo</a></li>
              </ul>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li><a href="mailto:hello@empay.com">hello@empay.com</a></li>
                <li><a href="tel:+911234567890">+91 12345 67890</a></li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="ln-footer-bottom">© 2026 EmPay HRMS. Made in India.</div>
        </div>
      </footer>

      {videoOpen && (
        <div className="ln-video-modal" onClick={() => setVideoOpen(false)}>
          <div className="ln-video-frame" onClick={(e) => e.stopPropagation()}>
            <button className="ln-video-close" onClick={() => setVideoOpen(false)} aria-label="Close">×</button>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="EmPay HRMS Demo"
              frameBorder={0}
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
