import request from 'supertest';
import app from '../server.js';
import Response from '../models/Response.js';

describe('Tests des endpoints de réponses', () => {
    // Données de test
    const userPayload = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
    };

    const surveyPayload = {
        name: 'Test Survey',
        questions: [
            {
                text: 'Question test 1',
                type: 'yes/no'
            },
            {
                text: 'Question test 2',
                type: 'mcq',
                options: ['Option 1', 'Option 2', 'Option 3']
            }
        ]
    };

    let authToken;
    let surveyId;
    let questionIds;

    // Avant chaque test, créer un utilisateur, obtenir le token et créer un sondage
    beforeEach(async () => {
        // Créer l'utilisateur et obtenir le token
        await request(app)
            .post('/api/users/signup')
            .send(userPayload);

        const loginRes = await request(app)
            .post('/api/users/login')
            .send({
                email: userPayload.email,
                password: userPayload.password
            });

        authToken = loginRes.body.token;

        // Créer le sondage
        const surveyRes = await request(app)
            .post('/api/surveys')
            .set('Authorization', `Bearer ${authToken}`)
            .send(surveyPayload);

        surveyId = surveyRes.body._id;
        questionIds = [surveyRes.body.questions[0]._id, surveyRes.body.questions[1]._id];
    });

    describe('POST /api/responses', () => {
        test('devrait créer une nouvelle réponse avec authentification', async () => {
            const responsePayload = {
                surveyId: surveyId,
                answers: [
                    {
                        questionId: questionIds[0],
                        value: 'yes'
                    },
                    {
                        questionId: questionIds[1],
                        value: 'Option 1'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(responsePayload);
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('survey_id', surveyId);
            expect(res.body.answers).toHaveLength(2);
        });

        test('ne devrait pas créer une réponse sans authentification', async () => {
            const responsePayload = {
                surveyId: surveyId,
                answers: [
                    {
                        questionId: questionIds[0],
                        value: 'yes'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/responses')
                .send(responsePayload);
            
            expect(res.statusCode).toBe(401);
        });

        test('ne devrait pas créer une réponse pour un sondage inexistant', async () => {
            const responsePayload = {
                surveyId: '123456789012345678901234',
                answers: [
                    {
                        questionId: questionIds[0],
                        value: 'yes'
                    }
                ]
            };

            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(responsePayload);
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Sondage non trouvé');
        });

        test('ne devrait pas créer une réponse sans réponses', async () => {
            const responsePayload = {
                surveyId: surveyId,
                answers: []
            };

            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(responsePayload);
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Le sondage doit contenir au moins une réponse.');
        });

        test('ne devrait pas permettre de répondre deux fois au même sondage', async () => {
            const responsePayload = {
                surveyId: surveyId,
                answers: [
                    {
                        questionId: questionIds[0],
                        value: 'yes'
                    }
                ]
            };

            // Première réponse
            await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(responsePayload);

            // Deuxième tentative
            const res = await request(app)
                .post('/api/responses')
                .set('Authorization', `Bearer ${authToken}`)
                .send(responsePayload);
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Vous avez déjà répondu à ce sondage');
        });

        // Validation du format des réponses
        test('ne devrait pas accepter une réponse avec un format invalide', async () => {
            const responsePayload = {
                surveyId: surveyId,
                answers: [{ value: 'yes' }] // Manque questionId
            };
        });

        // Validation du type de réponse
        test('ne devrait pas accepter une réponse incorrecte pour une question MCQ', async () => {
            const responsePayload = {
                surveyId: surveyId,
                answers: [{
                    questionId: questionIds[1], // question MCQ
                    value: 'InvalidOption' // Option qui n'existe pas
                }]
            };
        });
    });
}); 