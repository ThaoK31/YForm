import { submitResponse, getResponseById, getSurveyResponses, getUserResponses } from './responses';
import { ResponseData, SurveyResponse, UserResponse, Question } from '../types/api';

describe('Responses API', () => {
  const mockToken = 'test-token';
  const mockResponseData = {
    survey_id: '123',
    answers: [
      {
        question_id: '456',
        value: 'Test Answer'
      }
    ]
  };

  const mockSurvey: SurveyResponse = {
    _id: '123',
    name: 'Test Survey',
    creator: {
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    },
    questions: [
      {
        _id: '456',
        text: 'Test Question',
        type: 'open',
        options: []
      }
    ],
    created_at: new Date().toISOString(),
    __v: 0
  };

  const mockUser: UserResponse = {
    _id: 'user456',
    name: 'Respondent User',
    email: 'respondent@example.com'
  };

  const mockResponseResult: ResponseData = {
    _id: '789',
    survey_id: '123',
    user_id: 'user456',
    answers: [
      {
        question_id: '456',
        value: 'Test Answer'
      }
    ],
    created_at: new Date().toISOString()
  };

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  describe('submitResponse', () => {
    it('devrait soumettre une réponse avec succès', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: mockResponseResult, status: 201 }),
      });

      const result = await submitResponse(mockToken, mockResponseData);

      expect(result.data).toEqual(mockResponseResult);
      expect(result.status).toBe(201);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/responses'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(mockResponseData),
        })
      );
    });

    it('devrait gérer les erreurs de soumission', async () => {
      const errorMessage = 'Réponse déjà soumise';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: errorMessage, status: 409 }),
      });

      const result = await submitResponse(mockToken, mockResponseData);

      expect(result).toEqual({
        error: errorMessage,
        status: 409
      });
    });

    it('devrait gérer l\'absence de token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Token manquant', status: 401 }),
      });

      const result = await submitResponse('', mockResponseData);

      expect(result).toEqual({
        error: 'Token manquant',
        status: 401
      });
    });

    it('devrait valider les données de réponse', async () => {
      const invalidData = {
        survey_id: '',
        answers: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Données de réponse invalides', status: 400 }),
      });

      const result = await submitResponse(mockToken, invalidData);

      expect(result).toEqual({
        error: 'Données de réponse invalides',
        status: 400
      });
    });
  });

  describe('getResponseById', () => {
    it('devrait récupérer une réponse par son ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockResponseResult, status: 200 }),
      });

      const result = await getResponseById(mockToken, '789');

      expect(result.data).toEqual(mockResponseResult);
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/responses/789'),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('devrait gérer les erreurs de réponse non trouvée', async () => {
      const errorMessage = 'Réponse non trouvée';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: errorMessage, status: 404 }),
      });

      const result = await getResponseById(mockToken, 'invalid-id');

      expect(result).toEqual({
        error: errorMessage,
        status: 404
      });
    });
  });

  describe('getSurveyResponses', () => {
    it('devrait récupérer toutes les réponses d\'un sondage', async () => {
      const mockResponses = [mockResponseResult];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockResponses, status: 200 }),
      });

      const result = await getSurveyResponses(mockToken, '123');

      expect(result.data).toEqual(mockResponses);
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/responses/survey/123'),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('devrait gérer les erreurs d\'accès non autorisé', async () => {
      const errorMessage = 'Non autorisé';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: errorMessage, status: 403 }),
      });

      const result = await getSurveyResponses(mockToken, '123');

      expect(result).toEqual({
        error: errorMessage,
        status: 403
      });
    });
  });

  describe('getUserResponses', () => {
    it('devrait récupérer toutes les réponses de l\'utilisateur', async () => {
      const mockResponses = [mockResponseResult];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockResponses, status: 200 }),
      });

      const result = await getUserResponses(mockToken);

      expect(result.data).toEqual(mockResponses);
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/responses/user'),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      const errorMessage = 'Token invalide';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: errorMessage, status: 401 }),
      });

      const result = await getUserResponses(mockToken);

      expect(result).toEqual({
        error: errorMessage,
        status: 401
      });
    });
  });
}); 