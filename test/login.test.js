const request = require('supertest');

require('dotenv').config();

const baseUrl = process.env.LOCAL_URL;
// const baseUrl = process.env.LOCAL_URL;

describe('POST /login', () => {
    /**
     * Successful login test case
     * (Assumes user already exists, adjust email/password as needed)
     */
    it('should login with valid credentials', async () => {
        const res = await request(baseUrl)
            .post('/login')
            .send({
                email: 'collinscodes@gmail.com',
                password: 'MyshaylaAliyah'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    /**
     * Email missing test case
     */
    it('should fail if email is missing', async () => {
        const res = await request(baseUrl)
            .post('/login')
            .send({
                password: 'password123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email and password are required');
    });

    /**
     * Password missing test case
     */
    it('should fail if password is missing', async () => {
        const res = await request(baseUrl)
            .post('/login')
            .send({
                email: 'xyz@gmail.com'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email and password are required');
    });

    /**
     * Invalid email format test case
     */
    it('should fail if email is invalid', async () => {
        const res = await request(baseUrl)
            .post('/login')
            .send({
                email: 'invalid-email',
                password: 'password123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please provide a valid email address');
    });

    /**
     * Wrong password test case
     */
    it('should fail if password is incorrect', async () => {
        const res = await request(baseUrl)
            .post('/login')
            .send({
                email: 'collinscodes@gmail.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email or password');
    });

    /**
     * Non-existent user test case
     */
    it('should fail if user does not exist', async () => {
        const res = await request(baseUrl)
            .post('/login')
            .send({
                email: `nouser${Date.now()}@example.com`,
                password: 'password123'
            });
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email or password');
    });
});