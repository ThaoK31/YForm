import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './login-form'
import { useAuth } from '@/hooks/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

// Mock des dépendances
jest.mock('@/hooks/use-auth')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn()
}))
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))
jest.mock('lucide-react', () => ({
  MailIcon: () => <span data-testid="mail-icon" />,
  LockIcon: () => <span data-testid="lock-icon" />,
  EyeIcon: () => <span data-testid="eye-icon" />,
  EyeOffIcon: () => <span data-testid="eye-off-icon" />
}))

describe('LoginForm', () => {
  const mockSignIn = jest.fn()
  const mockSearchParams = new Map()
  const mockPush = jest.fn()

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks()

    // Configuration des mocks
    ;(useAuth as jest.Mock).mockReturnValue({ signIn: mockSignIn })
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
    })
  })

  it('devrait afficher le formulaire avec les champs requis', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('devrait basculer la visibilité du mot de passe', () => {
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('devrait afficher les erreurs de validation', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      expect(screen.getByText(/le mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument()
    })
  })

  it('devrait soumettre le formulaire avec succès', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(toast).toHaveBeenCalledWith({
        title: "Succès",
        description: 'Connexion réussie'
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('devrait gérer les erreurs de connexion', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Erreur de connexion'))
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erreur",
        description: 'Une erreur est survenue lors de la connexion'
      })
    })
  })

  it('devrait rediriger vers la page demandée après connexion', async () => {
    mockSearchParams.set('from', '/surveys')
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/surveys')
    })
  })

  it('devrait désactiver le bouton pendant la soumission', async () => {
    mockSignIn.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument()
    })
  })
}) 