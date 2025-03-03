import { useState, useEffect, useCallback } from "react"
import { getUserResponses } from "@/lib/api/responses"
import { EnrichedResponseData, EnrichedSurveyAnswer } from "@/lib/types/api"
import { useAuth } from "./use-auth"
import { toast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'

export function useUserResponses() {
  const { user } = useAuth()
  const [responses, setResponses] = useState<EnrichedResponseData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchResponses = useCallback(async () => {
    if (!user) return

    try {
      const token = Cookies.get('token')
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour voir vos réponses",
          variant: "destructive",
        })
        return
      }

      const result = await getUserResponses(token)
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
        return
      }
      
      if (result.data) {
        console.log('Données brutes reçues:', JSON.stringify(result.data, null, 2))

        // Transformer les réponses pour correspondre à la structure attendue
        const transformedResponses = result.data
          .filter(response => {
            if (!response) {
              console.warn('Réponse null ou undefined')
              return false
            }

            // Vérification détaillée de survey_id
            if (!response.survey_id) {
              console.warn('Sondage supprimé ou inaccessible pour la réponse:', response._id)
              return false
            }

            // Vérification spécifique des questions
            if (!response.survey_id.questions) {
              console.warn('Questions manquantes dans le sondage:', response.survey_id._id)
              return false
            }

            if (!Array.isArray(response.survey_id.questions)) {
              console.warn('Le format des questions est invalide pour le sondage:', response.survey_id._id)
              return false
            }

            if (!response.user_id) {
              console.warn('Utilisateur manquant pour la réponse:', response._id)
              return false
            }

            if (!Array.isArray(response.answers)) {
              console.warn('Format des réponses invalide pour la réponse:', response._id)
              return false
            }

            return true
          })
          .map(response => {
            try {
              // Log pour déboguer
              console.log('Traitement de la réponse:', {
                response_id: response._id,
                survey_id: response.survey_id._id,
                survey_name: response.survey_id.name,
                questions_count: response.survey_id.questions.length,
                answers_count: response.answers.length
              })

              // Enrichir les réponses avec les informations des questions
              const enrichedAnswers: EnrichedSurveyAnswer[] = response.answers
                .filter(answer => {
                  if (!answer.question_id || !answer.value) {
                    console.warn('Réponse invalide pour la question:', {
                      response_id: response._id,
                      answer
                    })
                    return false
                  }
                  return true
                })
                .map(answer => {
                  const question = response.survey_id.questions.find(
                    q => q && q._id === answer.question_id
                  )

                  if (!question) {
                    console.warn('Question non trouvée dans le sondage:', {
                      response_id: response._id,
                      survey_id: response.survey_id._id,
                      question_id: answer.question_id,
                      available_questions: response.survey_id.questions.map(q => ({
                        id: q._id,
                        text: q.text
                      }))
                    })
                    return null
                  }

                  return {
                    question,
                    value: answer.value
                  }
                })
                .filter((answer): answer is EnrichedSurveyAnswer => answer !== null)

              if (enrichedAnswers.length === 0) {
                console.warn('Aucune réponse valide trouvée pour:', {
                  response_id: response._id,
                  survey_id: response.survey_id._id
                })
                return null
              }

              // Créer un objet conforme à EnrichedResponseData
              const enrichedResponse: EnrichedResponseData = {
                _id: response._id,
                survey: response.survey_id,
                user: response.user_id || null,
                anonymous: response.anonymous,
                answers: enrichedAnswers,
                created_at: response.created_at
              }
              
              return enrichedResponse
            } catch (error) {
              console.error('Erreur lors de la transformation de la réponse:', {
                response_id: response._id,
                error
              })
              return null
            }
          })

        // Filtrer les null et les réponses invalides, puis trier
        const validResponses = transformedResponses
          .filter((response): response is EnrichedResponseData => {
            if (!response) return false

            const hasValidUser = response.anonymous || 
              (response.user && response.user.name);
              
            const isValid = Boolean(
              response.answers.length > 0 &&
              response.survey &&
              response.survey._id &&
              hasValidUser
            )

            if (!isValid) {
              console.warn('Réponse transformée invalide:', {
                response_id: response?._id,
                survey_id: response?.survey?._id
              })
            }
            return isValid
          })
          
        console.log('Réponses transformées:', validResponses)

        // Trier par date de création (plus récent en premier)
        const sortedResponses = validResponses.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        setResponses(sortedResponses)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des réponses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  return { responses, isLoading, mutate: fetchResponses }
} 