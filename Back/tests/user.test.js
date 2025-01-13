import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Tests des endpoints d\'authentification', () => {
    const userPayload = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
    };

    describe('POST /api/users/signup', () => {
        test('devrait créer un nouvel utilisateur', async () => {
            const res = await request(app)
                .post('/api/users/signup')
                .send(userPayload);
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès');
            expect(res.body).toHaveProperty('id');
        });

        test('ne devrait pas créer un utilisateur avec un email existant', async () => {
            // Premier utilisateur
            await request(app)
                .post('/api/users/signup')
                .send(userPayload);

            // Tentative avec le même email
            const res = await request(app)
                .post('/api/users/signup')
                .send(userPayload);
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('POST /api/users/login', () => {
        beforeEach(async () => {
            // Créer un utilisateur pour les tests de login
            await request(app)
                .post('/api/users/signup')
                .send(userPayload);
        });

        test('devrait connecter avec des identifiants valides', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: userPayload.email,
                    password: userPayload.password
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
        });

        test('ne devrait pas connecter avec un mauvais mot de passe', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: userPayload.email,
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });
}); 