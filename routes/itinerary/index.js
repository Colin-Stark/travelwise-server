const express = require('express');
const { UserItinerary, User } = require('../../database/schema');

const router = express.Router();

// POST /itinerary/list - POST-only retrieval for listing itineraries
router.post('/list', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: ["Email is required"]
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const itineraries = await UserItinerary.find({ user_id: user._id });

        res.status(200).json({
            success: true,
            data: itineraries
        });

    } catch (error) {
        console.error('Error listing itineraries:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /itinerary - Create a new itinerary
router.post('/', async (req, res) => {
    try {
        const { email, title, start_date, end_date, country, city, description, img, flight, schedules, gl } = req.body;

        if (!email || !title || !start_date || !end_date || !country || !city) {
            const details = [];
            if (!email) details.push("Email is required");
            if (!title) details.push("Title is required");
            if (!start_date) details.push("Start date is required");
            if (!end_date) details.push("End date is required");
            if (!country) details.push("Country is required");
            if (!city) details.push("City is required");
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details
            });
        }

        // Validate dates
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (start >= end) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: ["End date must be after start date"]
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate optional flight.price if provided
        if (flight && flight.price !== undefined && flight.price !== null) {
            const fp = Number(flight.price);
            if (Number.isNaN(fp) || fp < 0) {
                return res.status(400).json({ success: false, error: 'Validation failed', details: ['flight.price must be a non-negative number'] });
            }
            flight.price = fp;
        }

        // Validate optional hotel object if provided
        const hotel = req.body.hotel;
        if (hotel) {
            if (hotel.price !== undefined && hotel.price !== null) {
                const hp = Number(hotel.price);
                if (Number.isNaN(hp) || hp < 0) {
                    return res.status(400).json({ success: false, error: 'Validation failed', details: ['hotel.price must be a non-negative number'] });
                }
                hotel.price = hp;
            }
            if (hotel.property_token) hotel.property_token = String(hotel.property_token);
        }

        const newItinerary = new UserItinerary({
            user_id: user._id,
            id: Date.now(),
            gl,
            title,
            start_date,
            end_date,
            country,
            city,
            description,
            img,
            flight,
            hotel,
            schedules
        });

        await newItinerary.save();

        res.status(201).json({
            success: true,
            data: newItinerary
        });

    } catch (error) {
        console.error('Error creating itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /itinerary/get/:id - POST-only retrieval for a specific itinerary
router.post('/get/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: ["Email is required"]
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const itinerary = await UserItinerary.findOne({ _id: id, user_id: user._id });

        if (!itinerary) {
            return res.status(404).json({
                success: false,
                error: 'Itinerary not found'
            });
        }

        res.status(200).json({
            success: true,
            data: itinerary
        });

    } catch (error) {
        console.error('Error fetching itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /itinerary/update/:id - POST-only update endpoint for itineraries
router.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, title, start_date, end_date, country, city, description, img, flight, schedules, gl } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: ["Email is required"]
            });
        }

        // Validate dates if provided
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            if (start >= end) {
                return res.status(400).json({
                    success: false,
                    error: "Validation failed",
                    details: ["End date must be after start date"]
                });
            }
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Validate optional flight.price and hotel values before update
        if (flight && flight.price !== undefined && flight.price !== null) {
            const fp = Number(flight.price);
            if (Number.isNaN(fp) || fp < 0) {
                return res.status(400).json({ success: false, error: 'Validation failed', details: ['flight.price must be a non-negative number'] });
            }
            flight.price = fp;
        }
        const hotel = req.body.hotel;
        if (hotel) {
            if (hotel.price !== undefined && hotel.price !== null) {
                const hp = Number(hotel.price);
                if (Number.isNaN(hp) || hp < 0) {
                    return res.status(400).json({ success: false, error: 'Validation failed', details: ['hotel.price must be a non-negative number'] });
                }
                hotel.price = hp;
            }
            if (hotel.property_token) hotel.property_token = String(hotel.property_token);
        }

        const updatedItinerary = await UserItinerary.findOneAndUpdate(
            { _id: id, user_id: user._id },
            {
                gl,
                title,
                start_date,
                end_date,
                country,
                city,
                description,
                img,
                flight,
                hotel,
                schedules,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedItinerary) {
            return res.status(404).json({
                success: false,
                error: 'Itinerary not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedItinerary
        });

    } catch (error) {
        console.error('Error updating itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /itinerary/delete/:id - POST-only delete endpoint for itineraries
router.post('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: ["Email is required"]
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const deletedItinerary = await UserItinerary.findOneAndDelete({ _id: id, user_id: user._id });

        if (!deletedItinerary) {
            return res.status(404).json({
                success: false,
                error: 'Itinerary not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Itinerary deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting itinerary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;