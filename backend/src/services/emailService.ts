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
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #6366f1; }
        .credential-value { font-family: monospace; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-left: 10px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to EmPay HRMS</h1>
        </div>
        <div class="content">
          <p>Dear ${employeeName},</p>
          <p>Welcome to our organization! Your employee account has been created successfully.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials</h3>
            <div class="credential-item">
              <span class="credential-label">Login ID:</span>
              <span class="credential-value">${loginId}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Temporary Password:</span>
              <span class="credential-value">${password}</span>
            </div>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> For security reasons, you will be required to change your password on first login.
          </div>
          
          <p>You can access the system at:</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to EmPay HRMS</a>
          
          <p>If you have any questions or need assistance, please contact your HR department.</p>
          
          <p>Best regards,<br>EmPay HRMS Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2026 EmPay HRMS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Welcome to EmPay HRMS

Dear ${employeeName},

Your employee account has been created successfully.

Login Credentials:
- Login ID: ${loginId}
- Temporary Password: ${password}

IMPORTANT: You will be required to change your password on first login.

Access the system at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

Best regards,
EmPay HRMS Team
  `;
  
  await sendEmail({ to: email, subject, text, html });
};
