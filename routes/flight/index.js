const express = require('express');
const { Flight, User } = require('../../database/schema');

const router = express.Router();

// Utility: find user by email or userId
async function getUserFromBody(body) {
    const { email, userId } = body || {};
    if (email) return await User.findOne({ email: email.toLowerCase() });
    if (userId) return await User.findById(userId);
    return null;
}

// POST /api/flights - Create a new flight directly with details (no container needed)
router.post('/', async (req, res) => {
    try {
        const { email, departure_date, return_date, departure_country, departure_city, arrival_country, arrival_city, departure_token, price, status } = req.body;

        const details = [];
        if (!email && !req.body.userId) details.push('Either email or userId is required');
        if (!departure_date) details.push('departure_date is required');
        if (!return_date) details.push('return_date is required');
        if (!departure_country) details.push('departure_country is required');
        if (!departure_city) details.push('departure_city is required');
        if (!arrival_country) details.push('arrival_country is required');
        if (!arrival_city) details.push('arrival_city is required');
        if (price === undefined || price === null) details.push('price is required');
        if (details.length) return res.status(400).json({ success: false, error: 'Validation failed', details });

        const start = new Date(departure_date);
        const end = new Date(return_date);
        if (start >= end) return res.status(400).json({ success: false, error: 'Validation failed', details: ['return_date must be after departure_date'] });
        if (price < 0) return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const flightDetail = {
            user_id: user._id,
            departure_date: start,
            return_date: end,
            departure_country,
            departure_city,
            arrival_country,
            arrival_city,
            departure_token,
            price,
            status: status || 'booked',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const flight = new Flight({
            userId: user._id,
            name: `${departure_city} to ${arrival_city}`, // Auto-generate name
            destination: { country: arrival_country, city: arrival_city },
            startDate: start,
            endDate: end,
            flights: [flightDetail] // Embed the detail directly
        });
        await flight.save();
        return res.status(201).json({ success: true, data: flight });
    } catch (err) {
        console.error('Error creating flight:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/flights/:flightId/flights - Add a flight detail to a flight doc (mimics previous behavior)
router.post('/:flightId/flights', async (req, res) => {
    try {
        const { flightId } = req.params;
        const { email, departure_date, return_date, departure_country, departure_city, arrival_country, arrival_city, departure_token, price, status } = req.body;

        const details = [];
        if (!email && !req.body.userId) details.push('Either email or userId is required');
        if (!departure_date) details.push('departure_date is required');
        if (!return_date) details.push('return_date is required');
        if (!departure_country) details.push('departure_country is required');
        if (!departure_city) details.push('departure_city is required');
        if (!arrival_country) details.push('arrival_country is required');
        if (!arrival_city) details.push('arrival_city is required');
        if (price === undefined || price === null) details.push('price is required');
        if (details.length) return res.status(400).json({ success: false, error: 'Validation failed', details });

        const start = new Date(departure_date);
        const end = new Date(return_date);
        if (start >= end) return res.status(400).json({ success: false, error: 'Validation failed', details: ['return_date must be after departure_date'] });
        if (price < 0) return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const flightDoc = await Flight.findOne({ _id: flightId, userId: user._id });
        if (!flightDoc) return res.status(404).json({ success: false, error: 'Flight (replacement for trip) not found' });

        const flightDetail = {
            user_id: user._id,
            departure_date: start,
            return_date: end,
            departure_country,
            departure_city,
            arrival_country,
            arrival_city,
            departure_token,
            price,
            status: status || 'booked',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updated = await Flight.findOneAndUpdate({ _id: flightId }, { $push: { flights: flightDetail } }, { new: true });
        if (!updated) return res.status(500).json({ success: false, error: 'Failed to add flight detail' });

        const added = updated.flights[updated.flights.length - 1];
        return res.status(201).json({ success: true, data: added });
    } catch (err) {
        console.error('Error adding flight detail:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/flights/:flightId/flights/list - List flight details for a flight
router.post('/:flightId/flights/list', async (req, res) => {
    try {
        const { flightId } = req.params;
        const { email } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const flightDoc = await Flight.findOne({ _id: flightId, userId: user._id });
        if (!flightDoc) return res.status(404).json({ success: false, error: 'Flight not found' });

        return res.status(200).json({ success: true, data: flightDoc.flights || [] });
    } catch (err) {
        console.error('Error listing flight details:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/flights/:flightId/flights/update/:detailId - Update flight detail (POST only)
router.post('/:flightId/flights/update/:detailId', async (req, res) => {
    try {
        const { flightId, detailId } = req.params;
        const { email, departure_date, return_date, departure_country, departure_city, arrival_country, arrival_city, departure_token, price, status } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        // Optional validation as before
        if (departure_date && return_date) {
            const start = new Date(departure_date);
            const end = new Date(return_date);
            if (start >= end) return res.status(400).json({ success: false, error: 'Validation failed', details: ['return_date must be after departure_date'] });
        }
        if (price !== undefined && price !== null && price < 0) return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const update = {};
        if (departure_date) update['flights.$.departure_date'] = new Date(departure_date);
        if (return_date) update['flights.$.return_date'] = new Date(return_date);
        if (departure_country) update['flights.$.departure_country'] = departure_country;
        if (departure_city) update['flights.$.departure_city'] = departure_city;
        if (arrival_country) update['flights.$.arrival_country'] = arrival_country;
        if (arrival_city) update['flights.$.arrival_city'] = arrival_city;
        if (departure_token) update['flights.$.departure_token'] = departure_token;
        if (price !== undefined && price !== null) update['flights.$.price'] = price;
        if (status) update['flights.$.status'] = status;
        update['flights.$.updatedAt'] = new Date();

        if (Object.keys(update).length === 0) return res.status(400).json({ success: false, error: 'Validation failed', details: ['No fields provided for update'] });

        const result = await Flight.findOneAndUpdate({ _id: flightId, userId: user._id, 'flights._id': detailId }, { $set: update }, { new: true });
        if (!result) return res.status(404).json({ success: false, error: 'Flight or flight detail not found' });
        const updatedDetail = result.flights.id(detailId);
        return res.status(200).json({ success: true, data: updatedDetail });
    } catch (err) {
        console.error('Error updating flight detail:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/flights/:flightId/flights/delete/:detailId - Delete flight detail (POST only)
router.post('/:flightId/flights/delete/:detailId', async (req, res) => {
    try {
        const { flightId, detailId } = req.params;
        const { email } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const updated = await Flight.findOneAndUpdate({ _id: flightId, userId: user._id }, { $pull: { flights: { _id: detailId } } }, { new: true });
        if (!updated) return res.status(404).json({ success: false, error: 'Flight or flight detail not found' });
        return res.status(200).json({ success: true, message: 'Flight detail deleted successfully' });
    } catch (err) {
        console.error('Error deleting flight detail:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
