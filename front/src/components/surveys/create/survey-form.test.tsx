import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SurveyForm } from "./survey-form"
import { createSurvey } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { RawSurveyResponse } from "@/lib/types/api"

// Mocks
jest.mock("@/lib/api/survey")
jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn()
}))
jest.mock("next/navigation", () => ({
  useRouter: jest.fn()
}))
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn()
}))

// Mock les composants lucide-react
jest.mock("lucide-react", () => ({
  PlusCircle: () => <div data-testid="plus-icon"></div>,
  Trash2: () => <div data-testid="trash-icon"></div>,
  Image: () => <div data-testid="image-icon"></div>,
  Type: () => <div data-testid="type-icon"></div>,
  FileText: () => <div data-testid="file-icon"></div>,
  Video: () => <div data-testid="video-icon"></div>,
  Copy: () => <div data-testid="copy-icon"></div>,
  MoreVertical: () => <div data-testid="more-icon"></div>,
  GripVertical: () => <div data-testid="grip-icon"></div>,
  ChevronDown: () => <div data-testid="chevron-down-icon"></div>,
  ChevronUp: () => <div data-testid="chevron-up-icon"></div>,
  Check: () => <div data-testid="check-icon"></div>
}))

describe("SurveyForm", () => {  
  const mockRouter = {
    push: jest.fn(),
  }
  const mockUser = { _id: "user123", email: "test@example.com" }
  const mockCreateSurvey = createSurvey as jest.MockedFunction<typeof createSurvey>
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({ user: mockUser })
  })

  test("affiche le formulaire avec un titre et une question par défaut", () => {
    render(<SurveyForm />)
    
    expect(screen.getByPlaceholderText("Nom du sondage")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Question sans titre")).toBeInTheDocument()
    expect(screen.getByText("Publier le sondage")).toBeInTheDocument()
  })

  test("affiche une erreur si le titre est vide lors de la soumission", async () => {
    render(<SurveyForm />)
    
    fireEvent.click(screen.getByText("Publier le sondage"))
    
    await waitFor(() => {
      expect(screen.getByText("Le nom du sondage est requis")).toBeInTheDocument()
    })
  })

  test("affiche une erreur si la question est vide lors de la soumission", async () => {
    render(<SurveyForm />)
    
    const titleInput = screen.getByPlaceholderText("Nom du sondage")
    fireEvent.change(titleInput, { target: { value: "Mon sondage" } })
    
    fireEvent.click(screen.getByText("Publier le sondage"))
    
    await waitFor(() => {
      expect(screen.getByText("La question est requise")).toBeInTheDocument()
    })
  })

  test("crée un sondage avec succès", async () => {
    const mockSurveyResponse = {
      _id: "survey123",
      name: "Mon sondage",
      creator: {
        _id: "user123",
        name: "Test User",
        email: "test@example.com"
      },
      questions: [],
      created_at: new Date().toISOString(),
      __v: 0
    }

    mockCreateSurvey.mockResolvedValueOnce({
      data: mockSurveyResponse,
      status: 200
    })

    render(<SurveyForm />)
    
    // Remplir le titre
    const titleInput = screen.getByPlaceholderText("Nom du sondage")
    fireEvent.change(titleInput, { target: { value: "Mon sondage" } })
    
    // Remplir la question
    const questionInput = screen.getByPlaceholderText("Question sans titre")
    fireEvent.change(questionInput, { target: { value: "Ma question" } })
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText("Publier le sondage"))
    
    await waitFor(() => {
      expect(mockCreateSurvey).toHaveBeenCalledWith({
        name: "Mon sondage",
        questions: [{ text: "Ma question", type: "open", options: [], order: 1 }]
      })
      expect(mockRouter.push).toHaveBeenCalledWith("/surveys/survey123")
      expect(toast).toHaveBeenCalledWith({
        title: "Succès",
        description: "Sondage créé avec succès"
      })
    })
  })

  test("affiche une erreur si l'utilisateur n'est pas connecté", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null })
    
    render(<SurveyForm />)
    
    // Fill in required fields to pass form validation
    const titleInput = screen.getByPlaceholderText("Nom du sondage")
    fireEvent.change(titleInput, { target: { value: "Mon sondage" } })
    
    const questionInput = screen.getByPlaceholderText("Question sans titre")
    fireEvent.change(questionInput, { target: { value: "Ma question" } })
    
    // Submit the form
    fireEvent.click(screen.getByText("Publier le sondage"))
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour créer un sondage"
      })
    })
  })

  test("gère les erreurs de l'API", async () => {
    mockCreateSurvey.mockResolvedValueOnce({
      error: "Erreur serveur",
      status: 500
    })

    render(<SurveyForm />)
    
    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText("Nom du sondage"), {
      target: { value: "Mon sondage" }
    })
    fireEvent.change(screen.getByPlaceholderText("Question sans titre"), {
      target: { value: "Ma question" }
    })
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText("Publier le sondage"))
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur serveur"
      })
    })
  })
}) 