const express = require('express');
const { Trip, User } = require('../../database/schema');

const router = express.Router();

// Utility: find user by email or userId in request body
async function getUserFromBody(body) {
    const { email, userId } = body || {};
    if (email) return await User.findOne({ email: email.toLowerCase() });
    if (userId) return await User.findById(userId);
    return null;
}

// POST /api/trips - Create a new trip
router.post('/', async (req, res) => {
    try {
        const { email, name, destination, startDate, endDate } = req.body;
        const details = [];
        if (!email && !req.body.userId) details.push('Either email or userId is required');
        if (!name) details.push('Name is required');
        if (!destination || !destination.country || !destination.city) details.push('Destination country and city are required');
        if (!startDate) details.push('startDate is required');
        if (!endDate) details.push('endDate is required');
        if (details.length) return res.status(400).json({ success: false, error: 'Validation failed', details });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const trip = new Trip({
            userId: user._id,
            name,
            destination: {
                country: destination.country,
                city: destination.city
            },
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        await trip.save();
        return res.status(201).json({ success: true, data: trip });
    } catch (err) {
        console.error('Error creating trip:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/trips/:tripId/flights - Add a flight to a trip
router.post('/:tripId/flights', async (req, res) => {
    try {
        const { tripId } = req.params;
        const {
            email,
            departure_date,
            return_date,
            departure_country,
            departure_city,
            arrival_country,
            arrival_city,
            departure_token,
            price,
            status
        } = req.body;

        const details = [];
        if (!email && !req.body.userId) details.push('Either email or userId is required');
        if (!departure_date) details.push('departure_date is required');
        if (!return_date) details.push('return_date is required');
        if (!departure_country) details.push('departure_country is required');
        if (!departure_city) details.push('departure_city is required');
        if (!arrival_country) details.push('arrival_country is required');
        if (!arrival_city) details.push('arrival_city is required');
        if (price === undefined || price === null) details.push('price is required');

        if (details.length) {
            return res.status(400).json({ success: false, error: 'Validation failed', details });
        }

        const start = new Date(departure_date);
        const end = new Date(return_date);
        if (start >= end) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: ['return_date must be after departure_date'] });
        }
        if (price < 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });
        }

        // find user
        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // find trip by ownership
        const trip = await Trip.findOne({ _id: tripId, userId: user._id });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

        // Prepare flight object
        const flight = {
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

        // Push flight into trip.flights
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: tripId },
            { $push: { flights: flight } },
            { new: true }
        );

        if (!updatedTrip) return res.status(500).json({ success: false, error: 'Failed to add flight' });

        const addedFlight = updatedTrip.flights[updatedTrip.flights.length - 1];

        return res.status(201).json({ success: true, data: addedFlight });

    } catch (error) {
        console.error('Error adding flight to trip:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/trips/:tripId/flights/list - List flights for a trip
router.post('/:tripId/flights/list', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { email } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const trip = await Trip.findOne({ _id: tripId, userId: user._id });
        if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

        return res.status(200).json({ success: true, data: trip.flights || [] });
    } catch (err) {
        console.error('Error listing flights:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /api/trips/:tripId/flights/:flightId - Update a flight
router.put('/:tripId/flights/:flightId', async (req, res) => {
    try {
        const { tripId, flightId } = req.params;
        const { email, departure_date, return_date, departure_country, departure_city, arrival_country, arrival_city, departure_token, price, status } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        // Optional validation
        if (departure_date && return_date) {
            const start = new Date(departure_date);
            const end = new Date(return_date);
            if (start >= end) return res.status(400).json({ success: false, error: 'Validation failed', details: ['return_date must be after departure_date'] });
        }
        if (price !== undefined && price !== null && price < 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: ['price must be >= 0'] });
        }

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Use positional operator to update the flight element
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

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: ['No fields provided for update'] });
        }

        const result = await Trip.findOneAndUpdate(
            { _id: tripId, userId: user._id, 'flights._id': flightId },
            { $set: update },
            { new: true }
        );

        if (!result) return res.status(404).json({ success: false, error: 'Trip or flight not found' });

        const updatedFlight = result.flights.id(flightId);
        return res.status(200).json({ success: true, data: updatedFlight });
    } catch (err) {
        console.error('Error updating flight:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /api/trips/:tripId/flights/:flightId - Delete a flight
router.delete('/:tripId/flights/:flightId', async (req, res) => {
    try {
        const { tripId, flightId } = req.params;
        const { email } = req.body;
        if (!email && !req.body.userId) return res.status(400).json({ success: false, error: 'Validation failed', details: ['Either email or userId is required'] });

        const user = await getUserFromBody(req.body);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: tripId, userId: user._id },
            { $pull: { flights: { _id: flightId } } },
            { new: true }
        );

        if (!updatedTrip) return res.status(404).json({ success: false, error: 'Trip or flight not found' });

        return res.status(200).json({ success: true, message: 'Flight deleted successfully' });
    } catch (err) {
        console.error('Error deleting flight:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;