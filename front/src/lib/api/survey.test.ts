import { createSurvey, getUserSurveys, getSurveyById, updateSurvey, deleteSurvey } from './survey';
import { CreateSurveyData, UpdateSurveyData } from '@/lib/types/survey';
import Cookies from 'js-cookie';

jest.mock('js-cookie');

describe('Survey API', () => {
  const mockToken = 'test-token';
  const mockSurveyData: CreateSurveyData = {
    name: 'Test Survey',
    questions: [
      {
        text: 'Question 1',
        type: 'open',
        options: [], // Champ requis même pour les questions ouvertes
      },
    ],
  };

  const mockCreator = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
    // Mock Cookies.get to return our test token
    (Cookies.get as jest.Mock).mockReturnValue(mockToken);
  });

  describe('createSurvey', () => {
    test('devrait créer un sondage avec succès', async () => {
      const mockResponse = { 
        _id: '123',
        ...mockSurveyData,
        creator: mockCreator
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createSurvey(mockSurveyData);

      expect(result.data).toEqual(expect.objectContaining({
        _id: '123',
        name: 'Test Survey',
        creator: mockCreator
      }));
      expect(result.status).toBe(201);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/surveys'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(mockSurveyData),
        })
      );
    });

    test('devrait gérer les erreurs de création', async () => {
      const errorMessage = 'Erreur de création';
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      await expect(createSurvey(mockSurveyData)).rejects.toThrow(errorMessage);
    });
  });

  describe('getUserSurveys', () => {
    test('devrait récupérer les sondages de l\'utilisateur', async () => {
      const mockSurveys = [{
        _id: '123',
        ...mockSurveyData,
        creator: mockCreator
      }];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSurveys),
      });

      const result = await getUserSurveys();

      expect(result.data).toEqual(expect.arrayContaining([
        expect.objectContaining({
          _id: '123',
          name: 'Test Survey',
          creator: mockCreator
        })
      ]));
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/surveys/user'),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        })
      );
    });
  });

  describe('getSurveyById', () => {
    test('devrait récupérer un sondage par son ID', async () => {
      const surveyId = '123';
      const mockSurvey = {
        _id: surveyId,
        ...mockSurveyData,
        creator: mockCreator
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSurvey),
      });

      const result = await getSurveyById(surveyId);

      expect(result.data).toEqual(expect.objectContaining({
        _id: surveyId,
        name: 'Test Survey',
        creator: mockCreator
      }));
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/surveys/${surveyId}`),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    test('devrait gérer les erreurs de sondage non trouvé', async () => {
      const surveyId = 'invalid-id';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Sondage non trouvé' }),
      });

      const result = await getSurveyById(surveyId);

      expect(result).toEqual({
        error: 'Sondage non trouvé',
        status: 404
      });
    });

    test('devrait gérer les erreurs avec un ID undefined', async () => {
      const result = await getSurveyById(undefined as any);

      expect(result).toEqual({
        error: 'ID du sondage invalide',
        status: 400
      });
    });
  });

  describe('updateSurvey', () => {
    test('devrait mettre à jour un sondage', async () => {
      const surveyId = '123';
      const updateData: UpdateSurveyData = { name: 'Updated Survey' };
      const mockUpdatedSurvey = {
        _id: surveyId,
        ...mockSurveyData,
        ...updateData,
        creator: mockCreator
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUpdatedSurvey),
      });

      const result = await updateSurvey(surveyId, updateData);

      expect(result.data).toEqual(expect.objectContaining({
        _id: surveyId,
        name: 'Updated Survey',
        creator: mockCreator
      }));
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/surveys/${surveyId}`),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('deleteSurvey', () => {
    test('devrait supprimer un sondage', async () => {
      const surveyId = '123';
      const mockResponse = { message: 'Sondage supprimé' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await deleteSurvey(surveyId);

      expect(result).toEqual({
        data: mockResponse,
        status: 200
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/surveys/${surveyId}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        })
      );
    });
  });
}); 