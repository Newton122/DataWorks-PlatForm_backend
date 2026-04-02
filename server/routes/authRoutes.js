// routes/authRoutes.js
// Authentication routes


const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { signup, login } = authController;
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');



// @route   POST /api/auth/signup
// @desc    Register a new user
router.post(
	'/signup',
	[
		body('name').notEmpty().withMessage('Name is required'),
		body('email').isEmail().withMessage('Valid email is required'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
		body('role').optional().isIn(['client', 'freelancer', 'admin']).withMessage('Invalid role'),
		validate,
	],
	signup
);

// @route   POST /api/auth/login
// @desc    Login user
router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Valid email is required'),
		body('password').notEmpty().withMessage('Password is required'),
		validate,
	],
	login
);

// Get current user (protected)
router.get('/me', authMiddleware(), authController.getMe);




module.exports = router;

