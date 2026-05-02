interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { to, subject, text, html } = options;
  
  if (process.env.EMAIL_SERVICE === 'mock') {
    console.log('\n=== EMAIL SENT (MOCK) ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text || 'N/A'}`);
    console.log(`HTML: ${html ? 'Present' : 'N/A'}`);
    console.log('========================\n');
    return;
  }
  
  // Real email implementation would go here (SMTP, SendGrid, etc.)
  throw new Error('Real email service not configured');
};

export const sendWelcomeEmail = async (
  email: string,
  loginId: string,
  password: string,
  employeeName: string
): Promise<void> => {
  const subject = 'Welcome to EmPay HRMS - Your Login Credentials';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; }
        .email-wrapper { background-color: #f1f5f9; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 8px; font-weight: 600; }
        .header p { font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #0f172a; margin-bottom: 20px; font-weight: 500; }
        .intro-text { color: #475569; margin-bottom: 30px; line-height: 1.8; }
        .credentials-box { background: linear-gradient(to right, #f8fafc, #f1f5f9); border: 2px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 30px 0; }
        .credentials-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 20px; text-align: center; }
        .credential-item { background: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #6366f1; }
        .credential-item:last-child { margin-bottom: 0; }
        .credential-label { display: block; font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .credential-value { font-family: 'Courier New', monospace; font-size: 16px; color: #0f172a; font-weight: 600; background: #f8fafc; padding: 10px 15px; border-radius: 6px; display: inline-block; border: 1px solid #e2e8f0; }
        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .warning-box strong { color: #92400e; display: block; margin-bottom: 8px; font-size: 14px; }
        .warning-box p { color: #78350f; font-size: 14px; line-height: 1.6; }
        .cta-section { text-align: center; margin: 35px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3); transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .instructions { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .instructions h3 { font-size: 14px; color: #0f172a; margin-bottom: 12px; font-weight: 600; }
        .instructions ol { margin-left: 20px; color: #475569; }
        .instructions li { margin-bottom: 8px; font-size: 14px; }
        .support-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
        .support-section p { color: #64748b; font-size: 14px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #64748b; font-size: 12px; margin-bottom: 8px; }
        .footer-links { margin-top: 15px; }
        .footer-links a { color: #6366f1; text-decoration: none; margin: 0 10px; font-size: 12px; }
        .logo { font-size: 32px; font-weight: 700; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <div class="logo">EmPay</div>
            <h1>Welcome to EmPay HRMS</h1>
            <p>Your Gateway to Smart HR Management</p>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${employeeName},</p>
            
            <p class="intro-text">
              Welcome to our organization! We are excited to have you on board. Your employee account has been successfully created in our EmPay HRMS system. This platform will be your central hub for attendance, leave management, payroll, and more.
            </p>
            
            <div class="credentials-box">
              <div class="credentials-title">🔐 Your Login Credentials</div>
              <div class="credential-item">
                <span class="credential-label">Login ID</span>
                <span class="credential-value">${loginId}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Temporary Password</span>
                <span class="credential-value">${password}</span>
              </div>
            </div>
            
            <div class="warning-box">
              <strong>⚠️ Important Security Notice</strong>
              <p>For your security, you will be required to change your password immediately upon first login. Please keep your credentials confidential and do not share them with anyone.</p>
            </div>
            
            <div class="instructions">
              <h3>📝 Getting Started - Follow These Steps:</h3>
              <ol>
                <li>Click the login button below to access the EmPay HRMS portal</li>
                <li>Enter your Login ID and Temporary Password</li>
                <li>Create a strong new password when prompted</li>
                <li>Complete your profile information</li>
                <li>Explore the dashboard and familiarize yourself with the system</li>
              </ol>
            </div>
            
            <div class="cta-section">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to EmPay HRMS →</a>
            </div>
            
            <div class="support-section">
              <p>Need help getting started? Contact your HR department or IT support team for assistance.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated email from EmPay HRMS. Please do not reply to this message.</p>
            <p>&copy; 2026 EmPay HRMS. All rights reserved.</p>
            <div class="footer-links">
              <a href="#">Privacy Policy</a> | 
              <a href="#">Terms of Service</a> | 
              <a href="#">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
═══════════════════════════════════════════════════════════
                    WELCOME TO EMPAY HRMS
           Your Gateway to Smart HR Management
═══════════════════════════════════════════════════════════

Dear ${employeeName},

Welcome to our organization! We are excited to have you on board.

Your employee account has been successfully created in our EmPay HRMS 
system. This platform will be your central hub for attendance, leave 
management, payroll, and more.

───────────────────────────────────────────────────────────
🔐 YOUR LOGIN CREDENTIALS
───────────────────────────────────────────────────────────

Login ID:           ${loginId}
Temporary Password: ${password}

───────────────────────────────────────────────────────────
⚠️  IMPORTANT SECURITY NOTICE
───────────────────────────────────────────────────────────

For your security, you will be required to change your password 
immediately upon first login. Please keep your credentials 
confidential and do not share them with anyone.

───────────────────────────────────────────────────────────
📝 GETTING STARTED - FOLLOW THESE STEPS
───────────────────────────────────────────────────────────

1. Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
2. Enter your Login ID and Temporary Password
3. Create a strong new password when prompted
4. Complete your profile information
5. Explore the dashboard and familiarize yourself with the system

───────────────────────────────────────────────────────────

Need help getting started? Contact your HR department or IT 
support team for assistance.

Best regards,
EmPay HRMS Team

───────────────────────────────────────────────────────────
This is an automated email from EmPay HRMS.
Please do not reply to this message.

© 2026 EmPay HRMS. All rights reserved.
═══════════════════════════════════════════════════════════
  `;
  
  await sendEmail({ to: email, subject, text, html });
};
