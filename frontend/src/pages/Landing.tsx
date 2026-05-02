import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
                <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>EmPay HRMS</span>
            </div>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#demo-video">Demo</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
            <div className="nav-actions">
              <button className="btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="fade-in">Smart HR & Payroll for Smarter Workplaces</h1>
              <p className="fade-in delay-1">Manage employees, payroll, attendance, and performance — all in one intelligent platform.</p>
              <div className="hero-cta fade-in delay-2">
                <button className="btn-primary btn-large" onClick={() => navigate('/register')}>Get Started Free</button>
                <button className="btn-outline btn-large" onClick={() => navigate('/login')}>Sign In</button>
              </div>
              <div className="hero-stats fade-in delay-3">
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Companies</span>
                </div>
                <div className="stat">
                  <span className="stat-number">500K+</span>
                  <span className="stat-label">Employees</span>
                </div>
                <div className="stat">
                  <span className="stat-number">99.9%</span>
                  <span className="stat-label">Uptime</span>
                </div>
              </div>
            </div>
            <div className="hero-visual fade-in delay-2">
              <div className="dashboard-mockup">
                <div className="mockup-window">
                  <div className="mockup-header">
                    <div className="mockup-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="mockup-title">EmPay Dashboard</div>
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-sidebar">
                      <div className="mockup-menu-item active"></div>
                      <div className="mockup-menu-item"></div>
                      <div className="mockup-menu-item"></div>
                      <div className="mockup-menu-item"></div>
                    </div>
                    <div className="mockup-main">
                      <div className="mockup-cards">
                        <div className="mockup-card"></div>
                        <div className="mockup-card"></div>
                        <div className="mockup-card"></div>
                        <div className="mockup-card"></div>
                      </div>
                      <div className="mockup-chart"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Manage Your Workforce</h2>
            <p>Powerful features designed for modern HR teams</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#eef2ff"/>
                  <path d="M12 16H18V22H12V16Z M22 16H28V22H22V16Z M12 26H18V32H12V26Z M22 26H28V32H22V26Z" fill="#6366f1"/>
                </svg>
              </div>
              <h3>Auto-Generated Login IDs</h3>
              <p>Smart login ID generation with company code, name initials, year, and serial number.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#eef2ff"/>
                  <circle cx="20" cy="15" r="5" fill="#6366f1"/>
                  <path d="M12 30C12 25 15 22 20 22C25 22 28 25 28 30" stroke="#6366f1" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Role-Based Dashboards</h3>
              <p>Admin, HR, Payroll, and Employee-specific views tailored to each role's needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#eef2ff"/>
                  <rect x="12" y="12" width="16" height="16" rx="2" stroke="#6366f1" strokeWidth="2"/>
                  <path d="M16 20L18 22L24 16" stroke="#6366f1" strokeWidth="2"/>
                </svg>
              </div>
              <h3>One-Click Attendance</h3>
              <p>Single-click check-in/out with real-time status indicators and automatic tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#eef2ff"/>
                  <path d="M14 12H26V18H14V12Z M14 22H26V28H14V22Z" stroke="#6366f1" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Resume Auto-Extraction</h3>
              <p>Upload resumes and automatically extract employee details for quick onboarding.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#eef2ff"/>
                  <circle cx="20" cy="20" r="8" stroke="#6366f1" strokeWidth="2"/>
                  <path d="M20 14V20L24 22" stroke="#6366f1" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Performance Management</h3>
              <p>Track employee performance with reviews, ratings, and goal management.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="#eef2ff"/>
                  <path d="M20 12L24 16L20 20L16 16L20 12Z M20 20L24 24L20 28L16 24L20 20Z" fill="#6366f1"/>
                </svg>
              </div>
              <h3>Smart Payroll System</h3>
              <p>Automated salary calculations, tax deductions, and instant payslip generation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in 5 simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Company Registration</h3>
                <p>Sign up and become the Admin with full control over your organization.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Add Employees</h3>
                <p>HR adds employees with auto-generated login IDs or upload resumes for quick setup.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Track Attendance</h3>
                <p>Employees mark attendance with one click, HR monitors in real-time.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Process Payroll</h3>
                <p>Payroll team processes salaries with automated calculations and tax computation.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Employee Access</h3>
                <p>Employees access their self-service dashboard for payslips, leaves, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="demo-video">
        <div className="container">
          <div className="section-header">
            <h2>See EmPay in Action</h2>
            <p>Watch how our platform transforms HR and payroll management</p>
          </div>
          <div className="video-container">
            <div className="video-wrapper">
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="EmPay HRMS Demo Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <div className="video-features">
              <h3>What You'll Learn</h3>
              <ul>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#10b981"/>
                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Auto-generated login IDs and employee onboarding</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#10b981"/>
                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Single-click attendance tracking with status indicators</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#10b981"/>
                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Automated payroll with income tax computation</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#10b981"/>
                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Performance management and goal tracking</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#10b981"/>
                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Resume parsing for quick employee setup</span>
                </li>
              </ul>
              <button className="btn-primary btn-large" onClick={() => navigate('/register')}>Start Free Trial</button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your needs</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Starter</h3>
                <p>Perfect for small teams</p>
              </div>
              <div className="pricing-price">
                <span className="currency">$</span>
                <span className="amount">29</span>
                <span className="period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>Up to 25 employees</li>
                <li>Basic payroll</li>
                <li>Attendance tracking</li>
                <li>Leave management</li>
                <li>Email support</li>
              </ul>
              <button className="btn-outline btn-large" onClick={() => navigate('/register')}>Get Started</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Growth</h3>
                <p>For growing SMEs</p>
              </div>
              <div className="pricing-price">
                <span className="currency">$</span>
                <span className="amount">99</span>
                <span className="period">/month</span>
              </div>
              <ul className="pricing-features">
                <li>Up to 100 employees</li>
                <li>Advanced payroll</li>
                <li>Performance management</li>
                <li>Resume parsing</li>
                <li>Priority support</li>
                <li>Custom reports</li>
              </ul>
              <button className="btn-primary btn-large" onClick={() => navigate('/register')}>Get Started</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <p>For large organizations</p>
              </div>
              <div className="pricing-price">
                <span className="amount">Custom</span>
              </div>
              <ul className="pricing-features">
                <li>Unlimited employees</li>
                <li>All features included</li>
                <li>AI insights</li>
                <li>Dedicated support</li>
                <li>Custom integrations</li>
                <li>SLA guarantee</li>
              </ul>
              <button className="btn-outline btn-large" onClick={() => navigate('/login')}>Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <div className="footer-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#gradient2)"/>
                  <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white"/>
                  <defs>
                    <linearGradient id="gradient2" x1="0" y1="0" x2="32" y2="32">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span>EmPay HRMS</span>
              </div>
              <p>Smart HR & Payroll for Smarter Workplaces</p>
            </div>
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#demo-video">Demo</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@empay.com">hello@empay.com</a></li>
                <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 EmPay HRMS. All rights reserved.</p>
            <div className="footer-links">
              <button className="footer-link-btn" onClick={() => {}}>Privacy Policy</button>
              <button className="footer-link-btn" onClick={() => {}}>Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
