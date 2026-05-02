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
  email: Joi.string().email().required(),
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
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\d{10}$/).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  address: Joi.string().max(500).optional(),
  emergencyContactName: Joi.string().max(100).optional(),
  emergencyContactPhone: Joi.string().pattern(/^\d{10}$/).optional(),
  department: Joi.string().max(100).required(),
  designation: Joi.string().max(100).required(),
  dateOfJoining: Joi.date().max('now').required(),
  employmentType: Joi.string().valid('full_time', 'part_time', 'contract').required(),
  reportingManagerId: Joi.number().integer().positive().optional(),
  basicWage: Joi.number().positive().required(),
  pfApplicable: Joi.boolean().default(false),
  professionalTaxApplicable: Joi.boolean().default(false),
  bankAccountNumber: Joi.string().max(50).optional(),
  bankIfscCode: Joi.string().max(20).optional(),
});
