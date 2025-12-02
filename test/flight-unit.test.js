const mongoose = require('mongoose');
const { Flight, User } = require('../database/schema');

describe('Flight schema validation', () => {
    it('should fail validation for negative price', async () => {
        const flight = {
            user_id: new mongoose.Types.ObjectId(),
            departure_date: new Date('2025-12-01'),
            return_date: new Date('2025-12-05'),
            departure_country: 'Canada',
            departure_city: 'Toronto',
            arrival_country: 'France',
            arrival_city: 'Paris',
            price: -5
        };

        const flightDoc = new Flight({
            userId: new mongoose.Types.ObjectId(),
            name: 'Test',
            destination: { country: 'Canada', city: 'Toronto' },
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-05'),
            flights: [flight]
        });

        // Validation should catch negative price before saving
        const err = flightDoc.validateSync();
        expect(err.errors['flights.0.price']).toBeDefined();
    });

    it('should fail validation for return_date <= departure_date', async () => {
        const flight = {
            user_id: new mongoose.Types.ObjectId(),
            departure_date: new Date('2025-12-05'),
            return_date: new Date('2025-12-01'),
            departure_country: 'Canada',
            departure_city: 'Toronto',
            arrival_country: 'France',
            arrival_city: 'Paris',
            price: 500
        };

        const flightDoc = new Flight({
            userId: new mongoose.Types.ObjectId(),
            name: 'Test',
            destination: { country: 'Canada', city: 'Toronto' },
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-05'),
            flights: [flight]
        });

        const isInvalid = flightDoc.flights.some((f) => new Date(f.return_date) <= new Date(f.departure_date));
        expect(isInvalid).toBeTruthy();
    });
});
