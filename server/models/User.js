// models/User.js
// User model for DataWorks Hub

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    default: 'client',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Profile fields
  phone: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  jobsCompleted: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('User', userSchema);
