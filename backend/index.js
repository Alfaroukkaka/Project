// index.js
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import 'dotenv/config';

const app = express();
app.use(express.json());

const otpStore = {};

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
  res.status(200).json({ status: 'OK' });
});

// Send PIN endpoint
app.post('/api/send-pin', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const pin = String(crypto.randomInt(100000, 999999));
    otpStore[email] = {
      pin,
      expires: Date.now() + 10 * 60 * 1000
    };
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your Verification PIN',
      text: `Your verification PIN is: ${pin} (expires in 10 minutes).`,
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Send PIN error:', err);
    res.status(500).json({ error: 'Failed to send PIN' });
  }
});

// Verify PIN endpoint
app.post('/api/verify-pin', (req, res) => {
  try {
    const { email, pin } = req.body;
    const record = otpStore[email];
    
    if (!record || record.pin !== pin || record.expires <= Date.now()) {
      return res.json({ verified: false });
    }
    
    delete otpStore[email];
    res.json({ verified: true });
  } catch (err) {
    console.error('Verify PIN error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});