// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory OTP storage (for production, use Redis or database)
const otpStore = {};

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Send PIN endpoint
app.post('/api/send-pin', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email address is required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    // Generate 6-digit PIN
    const pin = String(crypto.randomInt(100000, 999999));
    
    // Store PIN with expiration (10 minutes)
    otpStore[email] = {
      pin,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0
    };
    
    // Email options
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Verification Service'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Verification PIN',
      text: `Your verification PIN is: ${pin}\n\nThis PIN will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Verification PIN</h2>
          <p style="font-size: 18px;">Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2c3e50;">${pin}</span>
          </div>
          <p>This PIN will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: #777;">
            Sent by ${process.env.APP_NAME || 'Verification Service'}
          </p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`PIN sent to ${email}`);
    res.status(200).json({ 
      success: true, 
      message: 'Verification PIN sent to your email',
      expiresAt: otpStore[email].expires
    });
    
  } catch (error) {
    console.error('Error sending PIN:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification PIN',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify PIN endpoint
app.post('/api/verify-pin', (req, res) => {
  try {
    const { email, pin } = req.body;
    
    // Validate input
    if (!email || !pin) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and PIN are required' 
      });
    }
    
    // Check if record exists
    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({ 
        success: false, 
        error: 'No verification request found for this email' 
      });
    }
    
    // Check expiration
    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ 
        success: false, 
        error: 'Verification PIN has expired' 
      });
    }
    
    // Increment attempt counter
    record.attempts += 1;
    
    // Check attempts limit
    if (record.attempts > 3) {
      delete otpStore[email];
      return res.status(429).json({ 
        success: false, 
        error: 'Too many attempts. Please request a new PIN' 
      });
    }
    
    // Verify PIN
    if (record.pin === pin) {
      delete otpStore[email];
      return res.status(200).json({ 
        success: true, 
        message: 'PIN verified successfully' 
      });
    }
    
    // Incorrect PIN
    res.status(400).json({ 
      success: false, 
      error: 'Incorrect PIN',
      attemptsLeft: 3 - record.attempts
    });
    
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PIN Verification Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});