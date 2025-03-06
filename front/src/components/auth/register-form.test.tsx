import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegisterForm } from './register-form'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { register } from '@/lib/api/auth'

// Mock des dépendances
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}))
jest.mock('@/lib/api/auth')
jest.mock('lucide-react', () => ({
  User: () => <span data-testid="user-icon" />,
  Mail: () => <span data-testid="mail-icon" />,
  Lock: () => <span data-testid="lock-icon" />,
  Eye: () => <span data-testid="eye-icon" />,
  EyeOff: () => <span data-testid="eye-off-icon" />
}))

describe('RegisterForm', () => {
  const mockPush = jest.fn()
  const mockRegister = register as jest.Mock

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks()

    // Configuration des mocks
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    mockRegister.mockResolvedValue({ data: { message: 'Inscription réussie' } })
  })

  it('devrait afficher le formulaire avec les champs requis', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument()
  })

  it('devrait basculer la visibilité des mots de passe', () => {
    render(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^mot de passe$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i)
    const toggleButtons = screen.getAllByRole('button', { name: '' })

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButtons[1])
    expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButtons[1])
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })

  it('devrait afficher les erreurs de validation', async () => {
    render(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument()
      expect(screen.getByText(/veuillez entrer une adresse email valide/i)).toBeInTheDocument()
      expect(screen.getByText(/le mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument()
    })
  })

  it('devrait afficher une erreur si les mots de passe ne correspondent pas', async () => {
    render(<RegisterForm />)
    
    const nameInput = screen.getByLabelText(/nom/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^mot de passe$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument()
    })
  })

  it('devrait soumettre le formulaire avec succès', async () => {
    render(<RegisterForm />)
    
    const nameInput = screen.getByLabelText(/nom/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^mot de passe$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      })
      expect(toast).toHaveBeenCalledWith({
        title: "Succès",
        description: 'Inscription réussie'
      })
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('devrait gérer les erreurs d\'inscription', async () => {
    mockRegister.mockResolvedValueOnce({ 
      error: { error: 'Cette adresse email est déjà utilisée' } 
    })
    
    render(<RegisterForm />)
    
    const nameInput = screen.getByLabelText(/nom/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^mot de passe$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erreur",
        description: 'Cette adresse email est déjà utilisée'
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('devrait désactiver le bouton pendant la soumission', async () => {
    mockRegister.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<RegisterForm />)
    
    const nameInput = screen.getByLabelText(/nom/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^mot de passe$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/inscription en cours/i)).toBeInTheDocument()
    })
  })
}) 