import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const pinLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many PIN requests');
const authLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts');
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests');

// Apply general rate limiting to all routes
app.use(generalLimiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tawfeer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  type: { type: String, required: true, enum: ['Household', 'Restaurant', 'Supermarket', 'Organization', 'Other'] },
  address: { type: String },
  points: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['donation', 'request'] },
  people: { type: Number, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'completed', 'rejected'] },
  acknowledged: { type: Boolean, default: false },
  driverName: { type: String },
  driverPhone: { type: String },
  estimatedPickup: { type: String },
  estimatedDelivery: { type: String },
  imageUri: { type: String },
  // Donation specific
  isNew: { type: Boolean },
  isConsumable: { type: Boolean },
  foodType: { type: String },
  weight: { type: String },
  // Request specific
  reason: { type: String },
  // Uncooked food specific
  isCooked: { type: Boolean, default: true },
  uncookedType: { type: String },
  uncookedQuantity: { type: String },
  uncookedUnit: { type: String, default: 'items' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['approval', 'completion', 'system'] },
  title: { type: String, required: true },
  content: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Message = mongoose.model('Message', messageSchema);

// In-memory OTP store
const otpStore = new Map();
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Clean expired OTPs every hour
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expires <= now) {
      otpStore.delete(email);
    }
  }
}, 60 * 60 * 1000);

// Email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true
  }
});

// Utility functions
const generateOTP = () => String(crypto.randomInt(100000, 999999));
const hashPassword = async (password) => await bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

// Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (req.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Send PIN
app.post('/api/send-pin', pinLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pin = generateOTP();
    otpStore.set(email, {
      pin,
      expires: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    const mailOptions = {
      from: "Tawfeer App" <${process.env.SMTP_USER}>,
      to: email,
      subject: 'Your Tawfeer Verification PIN',
      html :`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2E7D32; color: white; padding: 15px; border-radius: 5px; text-align: center;">
            <h1 style="margin: 0;">Tawfeer</h1>
            <p style="margin: 5px 0 0 0;">Food Waste Reduction Initiative</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="color: #333; margin-top: 0;">Your Verification PIN</h2>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2E7D32;">${pin}</span>
            </div>
            <p style="color: #666; margin: 0;">This PIN expires in 10 minutes</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(📧 PIN sent to: ${email.substring(0, 3)}***@***);
    
    res.json({ success: true, message: 'PIN sent successfully' });
  } catch (error) {
    console.error('Send PIN error:', error);
    res.status(500).json({ error: 'Failed to send PIN' });
  }
});

// Verify PIN
app.post('/api/verify-pin', authLimiter, async (req, res) => {
  try {
    const { email, pin } = req.body;
    
    if (!email || !pin) {
      return res.status(400).json({ error: 'Email and PIN required' });
    }

    const record = otpStore.get(email);
    if (!record || record.pin !== pin || record.expires <= Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired PIN' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isVerified = true;
    await user.save();
    otpStore.delete(email);

    const token = generateToken(user._id);
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        points: user.points
      }
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, type, address } = req.body;
    
    if (!name || !email || !phone || !password || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      type,
      address
    });

    await user.save();
    
    const pin = generateOTP();
    otpStore.set(email, {
      pin,
      expires: Date.now() + OTP_EXPIRY,
      attempts: 0
    });

    const mailOptions = {
      from: "Tawfeer App" <${process.env.SMTP_USER}>,
      to: email,
      subject: 'Welcome to Tawfeer - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2E7D32; color: white; padding: 15px; border-radius: 5px; text-align: center;">
            <h1 style="margin: 0;">Welcome to Tawfeer</h1>
            <p style="margin: 5px 0 0 0;">Food Waste Reduction Initiative</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p>Thank you for registering with Tawfeer. Please use the PIN below to verify your email:</p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2E7D32;">${pin}</span>
            </div>
            <p style="color: #666;">This PIN expires in 10 minutes</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful. Please check your email for verification PIN.',
      userId: user._id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        points: user.points,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, type, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, type, address, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create donation
app.post('/api/donations', authenticateToken, async (req, res) => {
  try {
    const {
      people,
      location,
      phone,
      imageUri,
      isNew,
      isConsumable,
      isCooked,
      uncookedType,
      uncookedQuantity,
      uncookedUnit
    } = req.body;

    if (!people || !location || !phone || !imageUri) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const order = new Order({
      userId: req.user._id,
      type: 'donation',
      people,
      location,
      phone,
      imageUri,
      isNew,
      isConsumable,
      isCooked,
      uncookedType,
      uncookedQuantity,
      uncookedUnit,
      foodType: isCooked ? (isNew ? 'Prepared Food' : 'Leftovers') : ${uncookedQuantity} ${uncookedUnit} of ${uncookedType},
      weight: isCooked ? ${Math.floor(Math.random() * 10) + 1} kg : ${uncookedQuantity} ${uncookedUnit}
    });

    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      order: {
        id: order._id,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Create request
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { people, reason, location, phone } = req.body;

    if (!people || !reason || !location || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const order = new Order({
      userId: req.user._id,
      type: 'request',
      people,
      reason,
      location,
      phone
    });

    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      order: {
        id: order._id,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get user messages
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user._id })
      .sort({ timestamp: -1 });
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Mark message as read
app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ success: true, message });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Admin Routes

// Get all users (admin)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get all orders (admin)
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get dashboard stats (admin)
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPoints = await User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalPoints: totalPoints[0]?.total || 0,
        pendingOrders,
        approvedOrders,
        completedOrders
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Update order status (admin)
app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, driverName, driverPhone, estimatedTime } = req.body;
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = new Date();
    
    if (driverName) order.driverName = driverName;
    if (driverPhone) order.driverPhone = driverPhone;
    
    if (status === 'approved') {
      if (order.type === 'donation') {
        order.estimatedPickup = estimatedTime;
      } else {
        order.estimatedDelivery = estimatedTime;
      }
      
      // Award points for donations
      if (order.type === 'donation') {
        const user = await User.findById(order.userId);
        user.points += 20;
        await user.save();
        
        // Send approval message
        const message = new Message({
          userId: order.userId,
          type: 'approval',
          title: 'Order Approved',
          content: `Your ${order.type} has been approved! ${driverName ? Driver: ${driverName} : ''}`,
          orderId: order._id
        });
        await message.save();
      }
    }
    
    if (status === 'completed') {
      // Send completion message
      const message = new Message({
        userId: order.userId,
        type: 'completion',
        title: 'Order Completed',
        content: Your ${order.type} has been completed. Thank you for your contribution!,
        orderId: order._id
      });
      await message.save();
    }
    
    await order.save();
    
    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete user (admin)
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Soft delete - mark as inactive
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    // Verify email configuration
    await transporter.verify();
    console.log('✅ Email server connection verified');
    
    app.listen(PORT, () => {
      console.log(🚀 Server running on port ${PORT});
      console.log(📧 Email service: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT});
      console.log(🗄  MongoDB connected);
      console.log(🌍 Environment: ${process.env.NODE_ENV || 'development'});
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();