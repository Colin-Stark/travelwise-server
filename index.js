const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

/**
 * ROUTES
 */
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const userManagementRouter = require('./routes/userManagement');
const itineraryRouter = require('./routes/itinerary');
const flightRouter = require('./routes/flight');
const hotelRouter = require('./routes/hotel');

/**
 * MIDDLEWARES
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const MONGO_URI = process.env.MONGO_CONNECTION_STRING;

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Travelwise API' });
});

app.get('/echo', (req, res) => {
    res.json({ received: req.body });
});



/**
 * ROUTES MIDDLEWARE
 */
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/userManagement', userManagementRouter);
app.use('/api/itineraries', itineraryRouter);
app.use('/api/flights', flightRouter);
app.use('/api/hotels', hotelRouter);


const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        // Remove process.exit(1) to avoid early exit
    }
};

connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

module.exports = app;
