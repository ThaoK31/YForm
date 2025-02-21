import { renderHook, act } from '@testing-library/react'
import { useAuth } from './use-auth'
import Cookies from 'js-cookie'

// Extend the type of Cookies for testing
declare module 'js-cookie' {
  interface CookiesStatic {
    get: jest.Mock;
    set: jest.Mock;
    remove: jest.Mock;
  }
}

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Nettoyer tous les mocks avant chaque test
    jest.clearAllMocks()
    // Réinitialiser les cookies
    ;(Cookies.get as jest.Mock).mockReset()
    ;(Cookies.set as jest.Mock).mockReset()
    ;(Cookies.remove as jest.Mock).mockReset()
  })

  describe('checkAuth', () => {
    test('devrait définir user à null si aucun token n\'existe', async () => {
      ;(Cookies.get as jest.Mock).mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      // Attendre que le checkAuth initial soit terminé
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBeFalsy()
    })

    test('devrait définir les données utilisateur si un token valide existe', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      ;(Cookies.get as jest.Mock).mockReturnValue('valid-token')
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBeFalsy()
    })

    test('devrait gérer un token invalide', async () => {
      ;(Cookies.get as jest.Mock).mockReturnValue('invalid-token')
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Token invalide' }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toBeNull()
      expect((Cookies.remove as jest.Mock)).toHaveBeenCalledWith('token')
    })

    test('devrait gérer une erreur réseau lors de la vérification', async () => {
      ;(Cookies.get as jest.Mock).mockReturnValue('valid-token')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBeFalsy()
    })
  })

  describe('signIn', () => {
    test('devrait connecter l\'utilisateur avec succès', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' }
      const mockResponse = { user: mockUser, token: 'test-token' }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signIn({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(result.current.user).toEqual(mockUser)
      expect((Cookies.set as jest.Mock)).toHaveBeenCalledWith(
        'token',
        'test-token',
        expect.any(Object)
      )
    })

    test('devrait gérer l\'erreur de connexion avec des identifiants invalides', async () => {
      const errorMessage = 'Invalid credentials'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signIn({
            email: 'test@example.com',
            password: 'wrong-password',
          })
        } catch (error) {
          expect(error).toBeDefined()
        }
      })

      expect(result.current.user).toBeNull()
      expect((Cookies.set as jest.Mock)).not.toHaveBeenCalled()
    })

    test('devrait gérer une erreur réseau lors de la connexion', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signIn({
            email: 'test@example.com',
            password: 'password123',
          })
        } catch (error) {
          expect(error).toBeDefined()
        }
      })

      expect(result.current.user).toBeNull()
      expect((Cookies.set as jest.Mock)).not.toHaveBeenCalled()
    })
  })

  describe('signUp', () => {
    test('devrait inscrire l\'utilisateur avec succès', async () => {
      const mockUser = { id: '1', name: 'New User', email: 'new@example.com' }
      const mockResponse = { user: mockUser, token: 'new-token' }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signUp({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        })
      })

      expect(result.current.user).toEqual(mockUser)
      expect((Cookies.set as jest.Mock)).toHaveBeenCalledWith(
        'token',
        'new-token',
        expect.any(Object)
      )
    })

    test('devrait gérer l\'erreur d\'inscription avec un email existant', async () => {
      const errorMessage = 'Email already exists'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signUp({
            name: 'New User',
            email: 'existing@example.com',
            password: 'password123',
          })
        } catch (error) {
          expect(error).toBeDefined()
        }
      })

      expect(result.current.user).toBeNull()
      expect((Cookies.set as jest.Mock)).not.toHaveBeenCalled()
    })
  })

  describe('signOut', () => {
    test('devrait déconnecter l\'utilisateur avec succès', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect((Cookies.remove as jest.Mock)).toHaveBeenCalledWith('token')
    })

    test('devrait gérer une erreur lors de la déconnexion', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect((Cookies.remove as jest.Mock)).toHaveBeenCalledWith('token')
    })
  })
}) 