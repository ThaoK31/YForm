import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import Survey from '../models/Survey.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Survey API Tests', () => {
    let testUser;
    let authToken;
    let testSurvey;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST);
    });

    beforeEach(async () => {
        // Nettoyer la base de données
        await Survey.deleteMany({});
        await User.deleteMany({});

        // Créer un utilisateur de test
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        // Obtenir un token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        authToken = loginResponse.body.token;

        // Créer un sondage de test via l'API
        const surveyResponse = await request(app)
            .post('/api/surveys')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: `Test Survey ${Date.now()}`,
                questions: [
                    {
                        text: 'Question 1',
                        type: 'open'
                    },
                    {
                        text: 'Question 2',
                        type: 'mcq',
                        options: ['Option 1', 'Option 2']
                    }
                ]
            });
        testSurvey = surveyResponse.body;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/surveys', () => {
        test('devrait créer un nouveau sondage', async () => {
            const newSurvey = {
                name: `New Survey ${Date.now()}`,
                questions: [
                    {
                        text: 'New Question',
                        type: 'open'
                    },
                    {
                        text: 'MCQ Question',
                        type: 'mcq',
                        options: ['Choice 1', 'Choice 2', 'Choice 3']
                    }
                ]
            };

            const res = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newSurvey);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toMatch(/^New Survey \d+$/);
            expect(res.body.creator._id).toBe(testUser._id.toString());
        });

        test('devrait retourner une erreur 400 si le nom est manquant', async () => {
            const invalidSurvey = {
                questions: [
                    {
                        text: 'Question',
                        type: 'open'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidSurvey);

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('nom');
        });

        test('devrait retourner une erreur 400 si le type de question est invalide', async () => {
            const invalidSurvey = {
                name: 'Invalid Survey',
                questions: [
                    {
                        text: 'Question',
                        type: 'invalid_type'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidSurvey);

            expect(res.status).toBe(400);
        });

        test('devrait retourner une erreur 400 si une question MCQ n\'a pas assez d\'options', async () => {
            const invalidSurvey = {
                name: 'Invalid Survey',
                questions: [
                    {
                        text: 'MCQ Question',
                        type: 'mcq',
                        options: ['Single Option']
                    }
                ]
            };

            const res = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidSurvey);

            expect(res.status).toBe(400);
        });

        test('devrait retourner 401 sans authentification', async () => {
            const newSurvey = {
                name: 'New Survey',
                questions: [
                    {
                        text: 'Question',
                        type: 'open'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/surveys')
                .send(newSurvey);

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/surveys', () => {
        test('devrait retourner tous les sondages', async () => {
            const res = await request(app)
                .get('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('name');
        });

        test('devrait retourner 401 sans authentification', async () => {
            const res = await request(app)
                .get('/api/surveys');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/surveys/:id', () => {
        test('devrait retourner un sondage spécifique', async () => {
            const res = await request(app)
                .get(`/api/surveys/${testSurvey._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toMatch(/^Test Survey \d+$/);
            expect(res.body.creator._id).toBe(testUser._id.toString());
        });

        test('devrait retourner 404 pour un ID invalide', async () => {
            const res = await request(app)
                .get('/api/surveys/123456789012345678901234')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/surveys/:id', () => {
        test('devrait mettre à jour un sondage', async () => {
            const updateData = {
                name: `Updated Survey ${Date.now()}`,
                questions: [
                    {
                        text: 'Updated Question',
                        type: 'yes/no'
                    }
                ]
            };

            const res = await request(app)
                .put(`/api/surveys/${testSurvey._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toMatch(/^Updated Survey \d+$/);
            expect(res.body.creator._id).toBe(testUser._id.toString());
        });

        test('devrait retourner 403 si non propriétaire', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'other@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .put(`/api/surveys/${testSurvey._id}`)
                .set('Authorization', `Bearer ${loginRes.body.token}`)
                .send({ name: 'Hacked Survey' });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/surveys/:id', () => {
        test('devrait supprimer un sondage', async () => {
            const res = await request(app)
                .delete(`/api/surveys/${testSurvey._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);

            const checkRes = await request(app)
                .get(`/api/surveys/${testSurvey._id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(checkRes.status).toBe(404);
        });

        test('devrait retourner 403 si non propriétaire', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'other@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .delete(`/api/surveys/${testSurvey._id}`)
                .set('Authorization', `Bearer ${loginRes.body.token}`);

            expect(res.status).toBe(403);
        });
    });
}); 