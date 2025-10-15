const request = require('supertest');
require('dotenv').config();

const baseUrl = process.env.BASE_URL;
// const baseUrl = process.env.LOCAL_URL;

describe('POST /userManagement/get-by-email', () => {
    let testEmail;

    beforeAll(async () => {
        testEmail = `testuser${Date.now()}@example.com`;
        // Create a user for testing
        await request(baseUrl)
            .post('/signup')
            .send({
                email: testEmail,
                password: 'BackendDev',
                confirmPassword: 'BackendDev'
            });
    });

    afterAll(async () => {
        // Clean up: delete the user
        await request(baseUrl)
            .delete('/userManagement/delete-by-email')
            .send({
                email: testEmail
            });
    });

    /**
     * Successful get user test case
     */
    it('should return user data for valid existing email', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({ email: testEmail });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testEmail.toLowerCase());
        expect(res.body.user.id).toBeDefined();
        expect(res.body.user).toHaveProperty('preferences');
    });

    /**
     * User not found test case
     */
    it('should return 404 if user does not exist', async () => {
        const nonExistentEmail = `nonexistent${Date.now()}@example.com`;
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({ email: nonExistentEmail });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
    });

    /**
     * Invalid email format test case
     */
    it('should return 400 for invalid email format', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({ email: 'invalid-email' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please provide a valid email address');
    });

    /**
     * Missing email test case
     */
    it('should return 400 if email is missing', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email is required');
    });

    /**
     * Email with different case test case (should be case insensitive)
     */
    it('should return user data regardless of email case', async () => {
        const upperCaseEmail = testEmail.toUpperCase();
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({ email: upperCaseEmail });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });

    /**
     * Empty email test case
     */
    it('should return 400 for empty email', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({ email: '' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email is required');
    });

    /**
     * Email with leading/trailing spaces test case
     */
    it('should handle email with spaces (invalid format)', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/get-by-email')
            .send({ email: ' test@example.com ' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please provide a valid email address');
    });
});
