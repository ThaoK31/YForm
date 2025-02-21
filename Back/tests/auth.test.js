import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Auth API Tests', () => {
    let testUser;
    let authToken;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST);
    });

    beforeEach(async () => {
        await User.deleteMany({});
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        test('devrait créer un nouvel utilisateur', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.name).toBe('New User');
            expect(res.body.user.email).toBe('new@example.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        test('devrait retourner une erreur 400 si le nom est manquant', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'new@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('requis');
        });

        test('devrait retourner une erreur 400 si l\'email est manquant', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('requis');
        });

        test('devrait retourner une erreur 400 si le mot de passe est manquant', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'new@example.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('requis');
        });

        test('devrait retourner une erreur si l\'email existe déjà', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Another User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('déjà utilisé');
        });

        test('devrait retourner une erreur si l\'email n\'est pas valide', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('email');
        });
    });

    describe('POST /api/auth/login', () => {
        test('devrait connecter un utilisateur avec des identifiants valides', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe('test@example.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        test('devrait refuser la connexion avec un email incorrect', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Identifiants invalides');
        });

        test('devrait refuser la connexion avec un mot de passe incorrect', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Identifiants invalides');
        });

        test('devrait retourner une erreur 400 si l\'email est manquant', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('requis');
        });

        test('devrait retourner une erreur 400 si le mot de passe est manquant', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('requis');
        });
    });

    describe('GET /api/auth/me', () => {
        test('devrait retourner le profil de l\'utilisateur authentifié', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty('id');
            expect(res.body.user.email).toBe('test@example.com');
            expect(res.body.user.name).toBe('Test User');
            expect(res.body.user).not.toHaveProperty('password');
        });

        test('devrait retourner 401 sans token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Token manquant');
        });

        test('devrait retourner 401 avec un token invalide', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token');

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Token invalide');
        });

        test('devrait retourner 401 avec un token mal formaté', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'invalid_format');

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Token manquant');
        });
    });
});
