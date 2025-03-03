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
        // Transformer les réponses pour correspondre à la structure attendue
        const transformedResponses = result.data
          .filter(response => {
            if (!response) {
              return false
            }

            // Vérification détaillée de survey_id
            if (!response.survey_id) {
              return false
            }

            // Vérification spécifique des questions
            if (!response.survey_id.questions) {
              return false
            }

            if (!Array.isArray(response.survey_id.questions)) {
              return false
            }

            if (!response.user_id) {
              return false
            }

            if (!Array.isArray(response.answers)) {
              return false
            }

            return true
          })
          .map(response => {
            try {
              // Enrichir les réponses avec les informations des questions
              const enrichedAnswers: EnrichedSurveyAnswer[] = response.answers
                .filter(answer => {
                  if (!answer.question_id || !answer.value) {
                    return false
                  }
                  return true
                })
                .map(answer => {
                  const question = response.survey_id.questions.find(
                    q => q && q._id === answer.question_id
                  )

                  if (!question) {
                    return null
                  }

                  return {
                    question,
                    value: answer.value
                  }
                })
                .filter((answer): answer is EnrichedSurveyAnswer => answer !== null)

              if (enrichedAnswers.length === 0) {
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
            }
            return isValid
          })
          
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