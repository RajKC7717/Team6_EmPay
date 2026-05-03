interface OtpEntry {
  otp: string;
  phone: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store (keyed by phone number)
const otpStore = new Map<string, OtpEntry>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of otpStore) {
    if (entry.expiresAt < now) otpStore.delete(key);
  }
}, 5 * 60 * 1000);

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOtp = (phone: string, otp: string): void => {
  otpStore.set(phone, {
    otp,
    phone,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
};

export const verifyOtp = (phone: string, otp: string): { valid: boolean; error?: string } => {
  const entry = otpStore.get(phone);

  if (!entry) {
    return { valid: false, error: 'No OTP found for this number. Please request a new one.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (entry.attempts >= 3) {
    otpStore.delete(phone);
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  entry.attempts++;

  if (entry.otp !== otp) {
    return { valid: false, error: `Incorrect OTP. ${3 - entry.attempts} attempts remaining.` };
  }

  // OTP verified — remove it
  otpStore.delete(phone);
  return { valid: true };
};

export const sendOtpSms = async (phone: string, otp: string): Promise<void> => {
  // Print OTP to backend console (works for demo)
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║       📱 OTP FOR PASSWORD RESET      ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Phone : ${phone.padEnd(27)}║`);
  console.log(`║  OTP   : ${otp}                         ║`);
  console.log(`║  Valid  : 10 minutes                  ║`);
  console.log('╚══════════════════════════════════════╝\n');
};
