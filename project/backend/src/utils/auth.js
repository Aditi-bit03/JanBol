const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'janbol-api',
      audience: 'janbol-app'
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'janbol-api',
      audience: 'janbol-app'
    }
  );
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret, {
    issuer: 'janbol-api',
    audience: 'janbol-app'
  });
};

const generatePasswordResetToken = () => {
  return jwt.sign(
    { 
      type: 'password_reset',
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateEmailVerificationToken = (email) => {
  return jwt.sign(
    { 
      email,
      type: 'email_verification'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  extractTokenFromHeader
};