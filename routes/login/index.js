const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../../database/schema');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// POST /login
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (
            !email ||
            !password ||
            email.trim() === '' ||
            password.trim() === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * Route to forgot password
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate required field
        if (!email || email.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        /** Generate 6-digit OTP */
        const otp = Math.floor(100000 + Math.random() * 900000);

        /** bcrypt encoded otp to store in database */
        const hashedOtp = await bcrypt.hash(otp.toString(), 12);

        /* Set OTP expiry to 10 minutes from now */
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        /* Save OTP and expiry to user document */
        user.otp = hashedOtp;
        user.otpexpirydate = expiry;
        await user.save();

        /**
         * Send OTP to user's email using Nodemailer
         */
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset OTP - Travelwise',
            text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent to email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            why: error.message
        });
    }
});


/**
 * Route to reset password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (
            !email ||
            !otp ||
            !newPassword ||
            !confirmPassword ||
            email.trim() === '' ||
            otp.toString().trim() === '' ||
            newPassword.trim() === '' ||
            confirmPassword.trim() === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, new password, and confirm password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check password length
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check OTP expiry
        if (!user.otpexpirydate || user.otpexpirydate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Compare OTP
        const isOtpValid = await bcrypt.compare(otp.toString(), user.otp);
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password and clear OTP fields
        user.passwordHash = newPasswordHash;
        user.otp = undefined;
        user.otpexpirydate = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


module.exports = router;
