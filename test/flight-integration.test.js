const request = require('supertest');
require('dotenv').config();

jest.setTimeout(30000);

const baseUrl = process.env.BASE_URL || process.env.LOCAL_URL || 'http://localhost:3000';
const { Flight, User } = require('../database/schema');

describe('POST /api/flights/:flightId/flights Integration', () => {
    let testEmail;
    let flightId;
    let testUserId;

    beforeAll(async () => {
        testEmail = `testuser${Date.now()}@example.com`;
        // Create user via signup endpoint
        await request(baseUrl)
            .post('/signup')
            .send({ email: testEmail, password: 'password123', confirmPassword: 'password123' });

        // Fetch user
        const user = await User.findOne({ email: testEmail.toLowerCase() });
        testUserId = user._id.toString();

        // Create flight document (replacement for trip)
        const flight = new Flight({
            userId: user._id,
            name: 'Test Flight',
            destination: { country: 'Canada', city: 'Toronto' },
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-04'),
        });
        await flight.save();
        flightId = flight._id.toString();
    });

    afterAll(async () => {
        try {
            // Delete created flight and cleanup user
            await Flight.deleteOne({ _id: flightId });
            await request(baseUrl)
                .delete('/userManagement/delete-by-email')
                .send({ email: testEmail });
        } catch (e) {
            console.error('Test cleanup error', e);
        }
    });

    it('should add a flight and return 201 with flight data', async () => {
        const res = await request(baseUrl)
            .post(`/api/flights/${flightId}/flights`)
            .send({
                email: testEmail,
                departure_date: '2025-12-01',
                return_date: '2025-12-05',
                departure_country: 'Canada',
                departure_city: 'Toronto',
                arrival_country: 'France',
                arrival_city: 'Paris',
                departure_token: 'token123',
                price: 500
            })
            .set('Accept', 'application/json');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.departure_city).toBe('Toronto');
        expect(res.body.data.arrival_city).toBe('Paris');
    });

    it('should list flights for the flight document', async () => {
        const listRes = await request(baseUrl)
            .post(`/api/flights/${flightId}/flights/list`)
            .send({ email: testEmail });

        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.success).toBe(true);
        expect(Array.isArray(listRes.body.data)).toBe(true);
        expect(listRes.body.data.length).toBeGreaterThan(0);
    });

    it('should list flights for the flight document using userId instead of email', async () => {
        const listRes = await request(baseUrl)
            .post(`/api/flights/${flightId}/flights/list`)
            .send({ userId: testUserId });

        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.success).toBe(true);
        expect(Array.isArray(listRes.body.data)).toBe(true);
        expect(listRes.body.data.length).toBeGreaterThan(0);
    });

    it('should update flight and return updated flight', async () => {
        // Find a flight id from the flight document
        const flight = await Flight.findById(flightId);
        const flightDetailId = flight.flights[0]._id.toString();

        const updateRes = await request(baseUrl)
            .post(`/api/flights/${flightId}/flights/update/${flightDetailId}`)
            .send({ email: testEmail, price: 600, status: 'pending' });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.success).toBe(true);
        expect(updateRes.body.data.price).toBe(600);
        expect(updateRes.body.data.status).toBe('pending');
    });

    it('should delete flight and return success', async () => {
        // Find a flight id from the flight document
        const flight = await Flight.findById(flightId);
        const flightDetailId = flight.flights[0]._id.toString();

        const deleteRes = await request(baseUrl)
            .post(`/api/flights/${flightId}/flights/delete/${flightDetailId}`)
            .send({ email: testEmail });

        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body.success).toBe(true);

        const listRes = await request(baseUrl)
            .post(`/api/flights/${flightId}/flights/list`)
            .send({ email: testEmail });
        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.data.length).toBe(0);
    });
});
