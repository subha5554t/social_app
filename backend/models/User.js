// ==========================================
// models/User.js - User Schema
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
      default: '', // URL or base64 string
    },
    bio: {
      type: String,
      maxlength: [150, 'Bio cannot exceed 150 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ---- Hash password before saving ----
userSchema.pre('save', async function (next) {
  // Only hash if password was modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ---- Method: Compare plain password with hash ----
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---- Never return password in JSON responses ----
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

module.exports = mongoose.model('User', userSchema);

/*
  Example User document:
  {
    "_id": "64f3b2c1e4b0f2a3c4d5e6f7",
    "username": "ramswaroop",
    "email": "ramswaroop@example.com",
    "password": "$2a$10$hashedPasswordHere...",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "TaskPlanet enthusiast 🏆",
    "createdAt": "2026-03-24T06:39:00.000Z",
    "updatedAt": "2026-03-24T06:39:00.000Z"
  }
*/
