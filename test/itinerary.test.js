const request = require('supertest');
const app = require('../index'); // Import the app directly for local testing

describe('Itinerary CRUD Operations', () => {
    let testEmail;
    let testItineraryId;

    beforeAll(async () => {
        testEmail = `testuser${Date.now()}@example.com`;
        // Create a user for testing
        const signupRes = await request(app)
            .post('/signup')
            .send({
                email: testEmail,
                password: 'BackendDev',
                confirmPassword: 'BackendDev'
            });
        expect(signupRes.statusCode).toBe(201);
    });

    afterAll(async () => {
        // Clean up: delete the user (this should cascade delete itineraries if implemented)
        await request(app)
            .delete('/userManagement/delete-by-email')
            .send({
                email: testEmail
            });
    });

    /**
     * POST /itinerary - Create itinerary
     */
    it('should create a new itinerary', async () => {
        const res = await request(app)
            .post('/api/itineraries')
            .send({
                email: testEmail,
                title: 'Paris Adventure',
                start_date: '2025-11-10',
                end_date: '2025-11-18',
                country: 'France',
                city: 'Paris',
                description: 'Explore the Eiffel Tower, Louvre, and enjoy French cuisine.',
                img: '/images/placeholder1.jpg',
                flight: {
                    departure_token: 'WyJDalJJY20wMGNXaGZaRzh0UTBsQlFWOXRVbEZDUnkwdExTMHRMUzB0TFhCcWEyc3hORUZCUVVGQlIycHNkRVE0UkZNMmRDMUJFZ3hWUVRnNE9YeFZRVEl6TXpJYUN3aVYxd29RQWhvRFZWTkVPQnh3bGRjSyIsW1siUEVLIiwiMjAyNS0xMC0wOCIsIlNGTyIsbnVsbCwiVUEiLCI4ODkiXSxbIlNGTyIsIjIwMjUtMTAtMDgiLCJBVVMiLG51bGwsIlVBIiwiMjMzMiJdXV0='
                },
                schedules: [
                    {
                        day: '2025-11-10',
                        locations: [
                            {
                                title: 'Eiffel Tower',
                                place_id: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
                                rating: 4.7,
                                reviews: 475344,
                                type: 'Tourist attraction',
                                address: 'Av. Gustave Eiffel, 75007 Paris, France',
                                open_state: 'Closes soon ⋅ 11 PM ⋅ Opens 9:30 AM Mon',
                                description: 'Landmark 330m-high 19th-century tower. Gustave Eiffel\'s iconic, wrought-iron 1889 tower, with steps and elevators to observation decks.',
                                service_options: {
                                    onsite_services: true
                                },
                                user_review: 'Quiet crowded with tourist.',
                                thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSyADJFVVyaVnRGnpdFclZRgD8CV_dzHscAUMGqeBedi0Y_e-oYwu3pULaKpfHa4M8VNVEGc7a3DOjQffJUDrL8gSRLWY_twZHnjP--OGcmDPirFXjPOwaCG5rtf7Iqbq_D2bGS_=w131-h92-k-no',
                                serpapi_thumbnail: 'https://serpapi.com/images/url/PJ9Dp3icBcFRboIwAADQE1VUZmRL_GBUyhwKQqjiT1NLKTBsC60h7n4ewtv43uvZWKvNl-P0jTsTSome3w0fmZKWSztj6uYIbQAzwDg-mrd9_vDhLsT4QbHMkNRVyPpLJqAXYFL9R4b5xR4N_JtX7bwkHKhyuru6iOmvriP6sffwAW8RW1MXJt2xrncFHGNP5Fl8KomdLpHsUgASxG4wbcfw3KXJRAO0Gm29_hmuA4HLK8rJZlq4C9B8LsEfkOoNBFVE3g',
                                time: '8:30 AM',
                                duration: 90
                            }
                        ]
                    }
                ]
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.itinerary).toBeDefined();
        expect(res.body.itinerary.title).toBe('Paris Adventure');
        testItineraryId = res.body.itinerary._id;
    });

    /**
     * GET /itinerary - Get all itineraries for user
     */
    it('should get all itineraries for user', async () => {
        const res = await request(app)
            .post('/api/itineraries/list')
            .send({ email: testEmail });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.itineraries)).toBe(true);
        expect(res.body.itineraries.length).toBeGreaterThan(0);
    });

    /**
     * GET /itinerary/:id - Get specific itinerary
     */
    it('should get a specific itinerary', async () => {
        const res = await request(app)
            .post(`/api/itineraries/get/${testItineraryId}`)
            .send({ email: testEmail });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.itinerary._id).toBe(testItineraryId);
        expect(res.body.itinerary.title).toBe('Paris Adventure');
    });

    /**
     * PUT /itinerary/:id - Update itinerary
     */
    it('should update an itinerary', async () => {
        const res = await request(app)
            .post(`/api/itineraries/update/${testItineraryId}`)
            .send({
                email: testEmail,
                title: 'Updated Paris Adventure',
                description: 'Updated description.'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.itinerary.title).toBe('Updated Paris Adventure');
        expect(res.body.itinerary.description).toBe('Updated description.');
    });

    /**
     * DELETE /itinerary/:id - Delete itinerary
     */
    it('should delete an itinerary', async () => {
        const res = await request(app)
            .post(`/api/itineraries/delete/${testItineraryId}`)
            .send({ email: testEmail });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Itinerary deleted successfully');
    });

    /**
     * GET /itinerary/:id after delete - Should fail
     */
    it('should return 404 for deleted itinerary', async () => {
        const res = await request(app)
            .post(`/api/itineraries/get/${testItineraryId}`)
            .send({ email: testEmail });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Itinerary not found');
    });

    /**
     * POST /itinerary - Missing required fields
     */
    it('should fail if required fields are missing', async () => {
        const res = await request(app)
            .post('/api/itineraries')
            .send({
                email: testEmail,
                title: 'Test Itinerary'
                // Missing start_date, end_date, country, city
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email, title, start_date, end_date, country, and city are required');
    });

    /**
     * GET /itinerary - Missing email
     */
    it('should fail if email is missing', async () => {
        const res = await request(app)
            .post('/api/itineraries/list')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email is required');
    });

    /**
     * GET /itinerary/:id - User not found
     */
    it('should fail if user does not exist', async () => {
        const res = await request(app)
            .post('/api/itineraries/get/someid')
            .send({ email: 'nonexistent@example.com' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
    });
});