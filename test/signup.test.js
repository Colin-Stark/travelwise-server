const request = require('supertest');
require('dotenv').config();

const baseUrl = process.env.BASE_URL;
// const baseUrl = process.env.LOCAL_URL;


describe('POST /signup (remote)', () => {
    /**
     * Successful signup test case
     */
    it.skip('should create a user with valid data', async () => {
        const res = await request(baseUrl)
            .post('/signup')
            .send({
                email: `collinscodes@gmail.com`,
                password: 'BackendDev',
                confirmPassword: 'BackendDev'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    /**
     * Email missing test case
     */
    it('should fail if email is missing', async () => {
        const res = await request(baseUrl)
            .post('/signup')
            .send({
                password: 'password123',
                confirmPassword: 'password123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email, password, and confirm password are required');
    });

    /**
     * Password missing test case
     */
    it('should fail if password is missing', async () => {
        const res = await request(baseUrl)
            .post('/signup')
            .send({
                email: `test${Date.now()}@example.com`,
                confirmPassword: 'password123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email, password, and confirm password are required');
    });

    /**
     * Password mismatch test case
     */
    it('should fail if passwords do not match', async () => {
        const res = await request(baseUrl)
            .post('/signup')
            .send({
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                confirmPassword: 'password321'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Passwords do not match');
    });

    /**
     * Password missing test case
     */
    it('should fail if password is missing', async () => {
        const res = await request(baseUrl)
            .post('/signup')
            .send({
                email: `test${Date.now()}@example.com`,
                password: 'short',
                confirmPassword: 'short'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Password must be at least 8 characters long');
    });

    /**
     * Email invalid test case
     */
    it('should fail if email is invalid', async () => {
        const res = await request(baseUrl)
            .post('/signup')
            .send({
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email address');
    });
});