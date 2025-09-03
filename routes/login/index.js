const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../../database/schema');

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

module.exports = router;
