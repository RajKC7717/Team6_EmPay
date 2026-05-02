import pool from '../config/database';

interface GenerateLoginIdParams {
  companyCode: string;
  firstName: string;
  lastName: string;
  joiningYear: number;
  companyId: number;
}

export const generateLoginId = async (params: GenerateLoginIdParams): Promise<string> => {
  const { companyCode, firstName, lastName, joiningYear, companyId } = params;
  
  const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
  const lastNamePrefix = lastName.substring(0, 2).toUpperCase();
  
  const serialNumber = await getNextSerialNumber(joiningYear, companyId);
  
  return `${companyCode}${firstNamePrefix}${lastNamePrefix}${joiningYear}${serialNumber.toString().padStart(4, '0')}`;
};

export const generatePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  password = password.charAt(0).toUpperCase() + password.slice(1);
  password += Math.floor(Math.random() * 10);
  
  return password;
};

export const getNextSerialNumber = async (joiningYear: number, companyId: number): Promise<number> => {
  const query = `
    SELECT MAX(serial_number) as max_serial 
    FROM employees 
    WHERE EXTRACT(YEAR FROM date_of_joining) = $1 
    AND company_id = $2
  `;
  
  const result = await pool.query(query, [joiningYear, companyId]);
  const maxSerial = result.rows[0].max_serial || 0;
  
  return maxSerial + 1;
};
