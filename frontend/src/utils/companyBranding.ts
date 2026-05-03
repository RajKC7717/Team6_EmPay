// Lightweight client-side branding storage. Allows companies to upload a logo
// during registration / settings, persisted as a base64 data URL in localStorage.
// Backend support can be added later (`companies.logo_url`) without changing
// component contracts.

const KEY_LOGO = 'empay_company_logo';
const KEY_NAME = 'empay_company_name';

export const getCompanyLogo = (): string | null => localStorage.getItem(KEY_LOGO);
export const getCompanyName = (): string | null => localStorage.getItem(KEY_NAME);

export const setCompanyLogo = (dataUrl: string | null) => {
  if (dataUrl) localStorage.setItem(KEY_LOGO, dataUrl);
  else localStorage.removeItem(KEY_LOGO);
};

export const setCompanyName = (name: string | null) => {
  if (name) localStorage.setItem(KEY_NAME, name);
  else localStorage.removeItem(KEY_NAME);
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
