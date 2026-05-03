import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  companyName: Joi.string().min(2).max(255).required(),
  companyCode: Joi.string().min(2).max(10).required(),
  phone: Joi.string().pattern(/^\d{10}$/).optional(),
  address: Joi.string().max(500).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    'string.empty': 'Email or Login ID is required',
    'any.required': 'Email or Login ID is required',
  }),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

export const resetPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

export const createEmployeeSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email (e.g. john@company.com)',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().pattern(/^\d{10}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Phone must be exactly 10 digits (e.g. 9876543210)',
  }),
  dateOfBirth: Joi.date().max('now').allow('', null).optional().messages({
    'date.max': 'Date of birth cannot be in the future',
  }),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null).optional(),
  address: Joi.string().max(500).allow('', null).optional(),
  emergencyContactName: Joi.string().max(100).allow('', null).optional(),
  emergencyContactPhone: Joi.string().pattern(/^\d{10}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Emergency phone must be exactly 10 digits',
  }),
  department: Joi.string().max(100).required().messages({
    'string.empty': 'Department is required (e.g. Engineering, HR, Finance)',
    'any.required': 'Department is required',
  }),
  designation: Joi.string().max(100).required().messages({
    'string.empty': 'Designation is required (e.g. Software Engineer)',
    'any.required': 'Designation is required',
  }),
  dateOfJoining: Joi.date().required().messages({
    'any.required': 'Date of joining is required',
    'date.base': 'Please enter a valid date of joining',
  }),
  employmentType: Joi.string().valid('full_time', 'part_time', 'contract', 'intern').required().messages({
    'any.only': 'Employment type must be Full-time, Part-time, Contract, or Intern',
    'any.required': 'Employment type is required',
  }),
  reportingManagerId: Joi.number().integer().positive().allow(null).optional(),
  basicWage: Joi.number().min(2000).required().messages({
    'number.base': 'Basic wage must be a number (e.g. 50000)',
    'number.min': 'Basic wage must be at least ₹2,000',
    'any.required': 'Basic wage is required',
  }),
  pfApplicable: Joi.boolean().default(false),
  professionalTaxApplicable: Joi.boolean().default(false),
  bankAccountNumber: Joi.string().pattern(/^\d{9,18}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Bank account must be 9-18 digits (numbers only)',
  }),
  bankIfscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).allow('', null).optional().messages({
    'string.pattern.base': 'IFSC must be 11 characters (e.g. HDFC0001234)',
  }),
});
