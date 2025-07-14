const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  // Indian phone number validation
  const phoneRegex = /^(\+91|91|0)?[6789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const validatePassword = (password) => {
  // At least 6 characters, contains at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

const validatePincode = (pincode) => {
  // Indian pincode validation (6 digits)
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

const validateCoordinates = (longitude, latitude) => {
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and trim whitespace
  return validator.escape(input.trim());
};

const validateFileUpload = (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return errors;
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed`);
  }
  
  return errors;
};

const validateIssueInput = (input) => {
  const errors = [];
  
  if (!input.title || input.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  }
  
  if (!input.description || input.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!input.category) {
    errors.push('Category is required');
  }
  
  if (!input.location || !input.location.coordinates) {
    errors.push('Location coordinates are required');
  } else {
    const [longitude, latitude] = input.location.coordinates.coordinates;
    if (!validateCoordinates(longitude, latitude)) {
      errors.push('Invalid coordinates provided');
    }
  }
  
  return errors;
};

const validateUserRegistration = (input) => {
  const errors = [];
  
  if (!input.name || input.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!validateEmail(input.email)) {
    errors.push('Invalid email format');
  }
  
  if (!validatePhone(input.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (!validatePassword(input.password)) {
    errors.push('Password must be at least 6 characters with letters and numbers');
  }
  
  return errors;
};

const validatePagination = (pagination) => {
  const errors = [];
  
  if (pagination) {
    if (pagination.first && (pagination.first < 1 || pagination.first > 100)) {
      errors.push('First parameter must be between 1 and 100');
    }
    
    if (pagination.last && (pagination.last < 1 || pagination.last > 100)) {
      errors.push('Last parameter must be between 1 and 100');
    }
    
    if (pagination.first && pagination.last) {
      errors.push('Cannot specify both first and last parameters');
    }
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validatePincode,
  validateCoordinates,
  sanitizeInput,
  validateFileUpload,
  validateIssueInput,
  validateUserRegistration,
  validatePagination
};