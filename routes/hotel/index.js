const express = require('express');
const { Hotel, User } = require('../../database/schema');

const router = express.Router();

// Utility to find user
async function getUserFromBody(body) {
    const { email, userId } = body || {};
    if (email) return await User.findOne({ email: email.toLowerCase() });
    if (userId) return await User.findById(userId);
    return null;
}

// POST /api/hotels - create hotel booking
router.post('/', async (req, res) => {
    try {
        const { email, name, check_in_date, check_out_date, property_token, price, latitude, longitude, country, city } = req.body;
        const details = [];
        if (!email && !req.body.userId) details.push('Either email or userId is required');
        if (!name) details.push('name is required');
        if (!check_in_date) details.push('check_in_date is required');
        if (!check_out_date) details.push('check_out_date is required');
        if (!country) details.push('country is required');
        if (!city) details.push('city is required');
        if (price === undefined || price === null) details.push('price is required');
        if (details.length) return res.status(400).json({ success: false, error: 'Validation failed', details });

        const start = new Date(check_in_date);
        const end = new Date(check_out_date);
        if (start >= end) return res.status(400).json({ success: false, error: 'Validation failed', details: ['check_out_date must be after check_in_date'] });
        if (price < 0) return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const hotel = new Hotel({
            userId: user._id,
            name,
            check_in_date: start,
            check_out_date: end,
            property_token,
            price,
            latitude,
            longitude,
            country,
            city
        });
        await hotel.save();
        return res.status(201).json({ success: true, data: hotel });
    } catch (err) {
        console.error('Error creating hotel:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/hotels/list - list hotels for user
router.post('/list', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Email is required'] });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        const hotels = await Hotel.find({ userId: user._id });
        return res.status(200).json({ success: true, data: hotels });
    } catch (err) {
        console.error('Error listing hotels:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/hotels/get/:id - get a single hotel booking
router.post('/get/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });
        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        const hotel = await Hotel.findOne({ _id: id, userId: user._id });
        if (!hotel) return res.status(404).json({ success: false, error: 'Hotel booking not found' });
        return res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        console.error('Error fetching hotel:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/hotels/update/:id - update a hotel booking
router.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, check_in_date, check_out_date, property_token, price, latitude, longitude, country, city } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        // Validate optional dates
        if (check_in_date && check_out_date) {
            const s = new Date(check_in_date);
            const e = new Date(check_out_date);
            if (s >= e) return res.status(400).json({ success: false, error: 'Validation failed', details: ['check_out_date must be after check_in_date'] });
        }
        if (price !== undefined && price !== null && price < 0) return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const update = {};
        if (name) update.name = name;
        if (check_in_date) update.check_in_date = new Date(check_in_date);
        if (check_out_date) update.check_out_date = new Date(check_out_date);
        if (property_token) update.property_token = property_token;
        if (price !== undefined && price !== null) update.price = price;
        if (latitude !== undefined) update.latitude = latitude;
        if (longitude !== undefined) update.longitude = longitude;
        if (country) update.country = country;
        if (city) update.city = city;
        update.updatedAt = new Date();

        if (Object.keys(update).length === 1 && update.updatedAt) return res.status(400).json({ success: false, error: 'Validation failed', details: ['No fields provided for update'] });

        const hotel = await Hotel.findOneAndUpdate({ _id: id, userId: user._id }, { $set: update }, { new: true });
        if (!hotel) return res.status(404).json({ success: false, error: 'Hotel booking not found' });
        return res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        console.error('Error updating hotel:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/hotels/delete/:id - delete a hotel booking
router.post('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });
        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        const deleted = await Hotel.findOneAndDelete({ _id: id, userId: user._id });
        if (!deleted) return res.status(404).json({ success: false, error: 'Hotel booking not found' });
        return res.status(200).json({ success: true, message: 'Hotel booking deleted successfully' });
    } catch (err) {
        console.error('Error deleting hotel:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
