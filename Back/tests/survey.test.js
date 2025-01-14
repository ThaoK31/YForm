import request from 'supertest';
import app from '../server.js';
import Survey from '../models/Survey.js';

describe('Tests des endpoints de sondages', () => {
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

    // Avant chaque test, créer un utilisateur et récupérer son token
    beforeEach(async () => {
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
    });

    describe('POST /api/surveys', () => {
        test('devrait créer un nouveau sondage avec authentification', async () => {
            const res = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('name', surveyPayload.name);
            expect(res.body.questions).toHaveLength(2);
        });

        test('ne devrait pas créer un sondage sans authentification', async () => {
            const res = await request(app)
                .post('/api/surveys')
                .send(surveyPayload);
            
            expect(res.statusCode).toBe(401);
        });

        test('ne devrait pas créer un sondage avec un nom existant', async () => {
            // Premier sondage
            await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);

            // Tentative avec le même nom
            const res = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        test('ne devrait pas créer un sondage avec une question MCQ sans options', async () => {
            const invalidSurvey = {
                name: 'Invalid Survey',
                questions: [{
                    text: 'Question MCQ',
                    type: 'mcq'
                }]
            };
        });

        test('devrait permettre de mettre à jour son propre sondage', async () => {
            // Test de PUT /api/surveys/:id
        });
    });

    describe('GET /api/surveys', () => {
        test('devrait récupérer tous les sondages', async () => {
            // Créer un sondage d'abord
            await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);

            const res = await request(app)
                .get('/api/surveys');
            
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('name', surveyPayload.name);
        });
    });

    describe('GET /api/surveys/:id', () => {
        test('devrait récupérer un sondage spécifique', async () => {
            // Créer un sondage
            const createRes = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);

            const surveyId = createRes.body._id;

            // Récupérer le sondage
            const res = await request(app)
                .get(`/api/surveys/${surveyId}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name', surveyPayload.name);
        });

        test('devrait retourner 404 pour un ID invalide', async () => {
            const res = await request(app)
                .get('/api/surveys/123456789012345678901234');
            
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/surveys/:id', () => {
        test('devrait supprimer un sondage avec authentification', async () => {
            // Créer un sondage
            const createRes = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);

            const surveyId = createRes.body._id;

            // Supprimer le sondage
            const res = await request(app)
                .delete(`/api/surveys/${surveyId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Sondage supprimé avec succès');
        });

        test('ne devrait pas supprimer un sondage sans authentification', async () => {
            // Créer un sondage
            const createRes = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);

            const surveyId = createRes.body._id;

            // Tenter de supprimer sans token
            const res = await request(app)
                .delete(`/api/surveys/${surveyId}`);
            
            expect(res.statusCode).toBe(401);
        });

        test('ne devrait pas supprimer le sondage d\'un autre utilisateur', async () => {
            // Créer un sondage
            const createRes = await request(app)
                .post('/api/surveys')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surveyPayload);

            const surveyId = createRes.body._id;

            // Créer un autre utilisateur
            const otherUser = {
                name: 'Other User',
                email: 'other@test.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/users/signup')
                .send(otherUser);

            const otherLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: otherUser.email,
                    password: otherUser.password
                });

            // Tenter de supprimer avec l'autre utilisateur
            const res = await request(app)
                .delete(`/api/surveys/${surveyId}`)
                .set('Authorization', `Bearer ${otherLoginRes.body.token}`);
            
            expect(res.statusCode).toBe(403);
        });
    });
}); 