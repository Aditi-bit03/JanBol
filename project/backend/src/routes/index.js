const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, audio, and documents
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// File upload endpoint
router.post('/upload', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/api/files/${file.filename}`
    }));

    logger.info(`Files uploaded: ${uploadedFiles.length} files`);

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const filePath = path.join(uploadPath, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Set appropriate headers
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  
  // Send file
  res.sendFile(path.resolve(filePath));
});

// Delete file endpoint
router.delete('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const filePath = path.join(uploadPath, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filename}`);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed'
    });
  }
});

// Webhook endpoint for external services
router.post('/webhook/:service', (req, res) => {
  const service = req.params.service;
  const payload = req.body;

  logger.info(`Webhook received from ${service}:`, payload);

  // Handle different webhook services
  switch (service) {
    case 'sms':
      // Handle SMS delivery status
      handleSMSWebhook(payload);
      break;
    case 'voice':
      // Handle voice call status
      handleVoiceWebhook(payload);
      break;
    case 'payment':
      // Handle payment notifications
      handlePaymentWebhook(payload);
      break;
    default:
      logger.warn(`Unknown webhook service: ${service}`);
  }

  res.json({ success: true, message: 'Webhook processed' });
});

// Health check for file system
router.get('/health/storage', (req, res) => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  
  try {
    // Check if upload directory exists and is writable
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Test write access
    const testFile = path.join(uploadPath, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    res.json({
      success: true,
      message: 'Storage is healthy',
      uploadPath
    });
  } catch (error) {
    logger.error('Storage health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Storage is not accessible',
      error: error.message
    });
  }
});

// Helper functions for webhook handling
function handleSMSWebhook(payload) {
  // Update notification status based on SMS delivery
  logger.info('SMS webhook processed:', payload);
}

function handleVoiceWebhook(payload) {
  // Update notification status based on voice call
  logger.info('Voice webhook processed:', payload);
}

function handlePaymentWebhook(payload) {
  // Handle payment confirmations
  logger.info('Payment webhook processed:', payload);
}

// Error handling middleware for routes
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
  }
  
  logger.error('Route error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

module.exports = router;