const request = require('supertest');
require('dotenv').config();

const baseUrl = process.env.LOCAL_URL;
// const baseUrl = process.env.LOCAL_URL;

describe.skip('POST /userManagement/update-user', () => {
    let testEmail;
    let testEmail2;

    beforeAll(async () => {
        testEmail = `testuser${Date.now()}@example.com`;
        testEmail2 = `testuser2${Date.now()}@example.com`;
        // Create two users for testing
        await request(baseUrl)
            .post('/signup')
            .send({
                email: testEmail,
                password: 'BackendDev',
                confirmPassword: 'BackendDev'
            });
        await request(baseUrl)
            .post('/signup')
            .send({
                email: testEmail2,
                password: 'BackendDev',
                confirmPassword: 'BackendDev'
            });
    });

    afterAll(async () => {
        // Clean up: delete the users
        await request(baseUrl)
            .delete('/userManagement/delete-by-email')
            .send({
                email: testEmail
            });
        await request(baseUrl)
            .delete('/userManagement/delete-by-email')
            .send({
                email: testEmail2
            });
    });

    /**
     * Successful update test case with all fields
     */
    it('should update user with all provided fields', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                email: testEmail,
                firstName: 'John',
                lastName: 'Doe',
                phone: '123-456-7890',
                preferences: {
                    currency: 'USD',
                    language: 'en',
                    timezone: 'PST',
                    marketingOptIn: true
                }
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User updated successfully');
        expect(res.body.user.firstName).toBe('John');
        expect(res.body.user.lastName).toBe('Doe');
        expect(res.body.user.phone).toBe('123-456-7890');
        expect(res.body.user.preferences.currency).toBe('USD');
    });

    /**
     * Successful partial update test case
     */
    it('should update user with partial fields', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                email: testEmail,
                firstName: 'Jane'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.firstName).toBe('Jane');
        // Other fields should remain unchanged
        expect(res.body.user.lastName).toBe('Doe');
    });

    /**
     * User not found test case
     */
    it('should return 404 if user does not exist', async () => {
        const nonExistentEmail = `nonexistent${Date.now()}@example.com`;
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                email: nonExistentEmail,
                firstName: 'Test'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User not found');
    });

    /**
     * Invalid email format test case
     */
    it('should return 400 for invalid email format', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                email: 'invalid-email',
                firstName: 'Test'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please provide a valid email address');
    });

    /**
     * Missing email test case
     */
    it('should return 400 if email is missing', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                firstName: 'Test'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email is required');
    });

    /**
     * Case insensitive email test case
     */
    it('should update user regardless of email case', async () => {
        const upperCaseEmail = testEmail.toUpperCase();
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                email: upperCaseEmail,
                firstName: 'CaseTest'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.firstName).toBe('CaseTest');
    });

    /**
     * Empty update test case (no fields to update)
     */
    it('should handle empty update gracefully', async () => {
        const res = await request(baseUrl)
            .post('/userManagement/update-user')
            .send({
                email: testEmail
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // Should return current user data
        expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });
});
