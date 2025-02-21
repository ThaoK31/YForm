import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Response API Tests', () => {
    let testUser;
    let authToken;
    let testSurvey;
    let testResponse;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST);
    });

    beforeEach(async () => {
        // Nettoyer la base de données
        await Response.deleteMany({});
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
                name: 'Test Survey',
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

        // Créer une réponse de test via l'API
        const responseData = {
            surveyId: testSurvey._id,
            answers: [
                {
                    questionId: testSurvey.questions[0]._id,
                    value: 'Test Answer 1'
                },
                {
                    questionId: testSurvey.questions[1]._id,
                    value: 'Option 1'
                }
            ]
        };

        const responseResponse = await request(app)
            .post('/api/responses')
            .set('Authorization', `Bearer ${authToken}`)
            .send(responseData);
        testResponse = responseResponse.body;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/responses', () => {
        test('devrait créer une nouvelle réponse', async () => {
            // Créer un autre utilisateur pour tester une nouvelle réponse
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const otherLoginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'other@example.com',
                    password: 'password123'
                });

            const newResponse = {
                surveyId: testSurvey._id,
                answers: [
                    {
                        questionId: testSurvey.questions[0]._id,
                        value: 'New Answer 1'
                    },
                    {
                        questionId: testSurvey.questions[1]._id,
                        value: 'Option 2'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${otherLoginRes.body.token}`)
                .send(newResponse);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.survey_id._id).toBe(testSurvey._id);
            expect(res.body.user_id._id).toBe(otherUser._id.toString());
        });

        test('devrait retourner une erreur 400 si les réponses sont manquantes', async () => {
            const invalidResponse = {
                surveyId: testSurvey._id
            };

            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidResponse);

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('réponse');
        });

        test('devrait retourner une erreur 400 si une réponse MCQ est invalide', async () => {
            const invalidResponse = {
                surveyId: testSurvey._id,
                answers: [
                    {
                        questionId: testSurvey.questions[1]._id,
                        value: 'Invalid Option'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidResponse);

            expect(res.status).toBe(400);
        });

        test('devrait retourner 401 sans authentification', async () => {
            const newResponse = {
                surveyId: testSurvey._id,
                answers: []
            };

            const res = await request(app)
                .post('/api/responses')
                .send(newResponse);

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/responses/survey/:surveyId', () => {
        it('devrait retourner toutes les réponses d\'un sondage', async () => {
            // Créer un sondage avec testUser comme créateur
            const surveyResponse = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Survey for Responses',
                    questions: [{ text: 'Question 1?', type: 'open' }]
                });
            
            const survey = surveyResponse.body;

            // Créer un autre utilisateur pour soumettre une réponse
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });
            const otherLoginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'other@example.com', password: 'password123' });

            // Soumettre une réponse avec l'autre utilisateur
            await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${otherLoginRes.body.token}`)
                .send({
                    surveyId: survey._id,
                    answers: [{ questionId: survey.questions[0]._id, value: 'Test Answer' }]
                });

            // Récupérer les réponses avec testUser (créateur du sondage)
            const res = await request(app)
                .get(`/api/responses/survey/${survey._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('answers');
        });

        test('devrait retourner 403 si non propriétaire du sondage', async () => {
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
                .get(`/api/responses/survey/${testSurvey._id}`)
                .set('Authorization', `Bearer ${loginRes.body.token}`);

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/responses/:id', () => {
        it('devrait retourner une réponse spécifique', async () => {
            // Créer un sondage
            const surveyResponse = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Survey for Response',
                    questions: [{ text: 'Question 1?', type: 'open' }]
                });
            
            const survey = surveyResponse.body;

            // Créer une réponse avec testUser
            const responseRes = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    surveyId: survey._id,
                    answers: [{ questionId: survey.questions[0]._id, value: 'Test Answer' }]
                });

            // Récupérer la réponse spécifique
            const res = await request(app)
                .get(`/api/responses/${responseRes.body._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.survey_id._id).toBe(survey._id);
        });

        test('devrait retourner 404 pour un ID invalide', async () => {
            const res = await request(app)
                .get('/api/responses/123456789012345678901234')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/responses/user', () => {
        it('devrait retourner toutes les réponses de l\'utilisateur', async () => {
            // Créer un sondage
            const surveyResponse = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: `Test Survey for User Responses ${Date.now()}`,
                    questions: [{ text: 'Question 1?', type: 'open' }]
                });
            
            const survey = surveyResponse.body;

            // Créer une réponse avec testUser
            await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    surveyId: survey._id,
                    answers: [{ questionId: survey.questions[0]._id, value: 'Test Answer' }]
                });

            // Récupérer les réponses de l'utilisateur
            const res = await request(app)
                .get('/api/responses/user')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].user_id._id).toBe(testUser._id.toString());
        });

        test('devrait retourner 401 sans authentification', async () => {
            const res = await request(app)
                .get('/api/responses/user');

            expect(res.status).toBe(401);
        });
    });
}); 