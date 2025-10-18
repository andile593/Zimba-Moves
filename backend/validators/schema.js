const Joi = require('joi');

exports.userSignupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{7,15}$/).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).optional().messages({
    'any.only': 'Passwords must match'
  }),
  role: Joi.string().valid('CUSTOMER', 'PROVIDER', 'ADMIN').required(),
  providerData: Joi.object({
    idNumber: Joi.string().min(5).max(20).required(),
    address: Joi.string().min(5).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    region: Joi.string().max(100).optional().allow('', null),
    postalCode: Joi.string().max(20).optional().allow('', null),
    country: Joi.string().max(100).optional().default('South Africa'),
    includeHelpers: Joi.boolean().optional().default(false)
  }).optional()
});

//login
exports.userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Provider 
exports.providerSchema = Joi.object({
  includeHelpers: Joi.boolean().optional().default(false),
  latitude: Joi.number().min(-90).max(90).optional().allow(null, ''),
  longitude: Joi.number().min(-180).max(180).optional().allow(null, ''),
  address: Joi.string().max(200).optional().allow(null, ''),
  city: Joi.string().max(100).optional().allow(null, ''),
  region: Joi.string().max(100).optional().allow(null, ''),
  country: Joi.string().max(100).optional().allow(null, ''),
  postalCode: Joi.string().max(20).optional().allow(null, '')
});

// Vehicle
exports.vehicleSchema = Joi.object({
  type: Joi.string().valid('SMALL_VAN', 'MEDIUM_TRUCK', 'LARGE_TRUCK', 'OTHER').required(),
  capacity: Joi.number().positive().required(),
  weight: Joi.number().positive().required(),
  plate: Joi.string().pattern(/^[A-Z0-9 ]+$/).required(),
  baseRate: Joi.number().positive().required(),
  perKmRate: Joi.number().positive().optional().default(0),
});

// Booking 
exports.bookingSchema = Joi.object({
  providerId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  pickup: Joi.string().required(),
  dropoff: Joi.string().required(),
  moveType: Joi.string().valid('APARTMENT', 'OFFICE', 'SINGLE_ITEM', 'OTHER').required(),
  dateTime: Joi.date().iso().required(),
  helpersRequired: Joi.number().min(0).required(),
  helpersProvidedBy: Joi.string().valid('CUSTOMER', 'PROVIDER').required(),
  pricing: Joi.object({
    total: Joi.number().positive().required(),
    baseRate: Joi.number().min(0).required(),
    perKmRate: Joi.number().min(0).required(),
    distance: Joi.number().min(0).required(),
    distanceCost: Joi.number().min(0).required(),
    helpersCost: Joi.number().min(0).required(),
    moveType: Joi.string().valid('APARTMENT', 'OFFICE', 'SINGLE_ITEM', 'OTHER').required(),
    paymentMethod: Joi.string().valid('paystack', 'ozow').required()
  }).required()
});

exports.createBookingSchema = exports.bookingSchema;

// Complaint
exports.complaintSchema = Joi.object({
  bookingId: Joi.string().required(),
  plateNumber: Joi.string().required(),
  issueTarget: Joi.string().valid('PROVIDER', 'HELPER', 'OTHER').required(),
  description: Joi.string().max(1000).required()
});

// Quote
exports.quoteSchema = Joi.object({
  providerId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  pickup: Joi.string().required(),
  dropoff: Joi.string().required(),
  moveType: Joi.string().valid('APARTMENT', 'OFFICE', 'SINGLE_ITEM', 'OTHER').required(),
  helpersNeeded: Joi.number().min(0).required()
});