import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

import { getSurveyResponses } from '@/lib/api/responses'
import { getUserSurveys } from '@/lib/api/survey'
import { EnrichedResponseData, SurveyResponse, RawResponseData, EnrichedSurveyAnswer } from '@/lib/types/api'

export function useRecentResponses() {
    const [responses, setResponses] = useState<EnrichedResponseData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const token = Cookies.get('token')
                if (!token) {
                    toast.error('Vous devez être connecté pour voir les réponses')
                    return
                }

                // 1. Récupérer tous les sondages de l'utilisateur
                const surveysResult = await getUserSurveys()
                if (surveysResult.error || !surveysResult.data) {
                    toast.error(surveysResult.error || 'Impossible de récupérer vos sondages')
                    return
                }

                // 2. Pour chaque sondage, récupérer ses réponses
                const allResponses: EnrichedResponseData[] = []
                for (const survey of surveysResult.data) {
                    const responsesResult = await getSurveyResponses(token, survey._id)
                    if (responsesResult.data) {
                        // Transformer les réponses pour correspondre à la structure attendue
                        const transformedResponses = responsesResult.data.map(response => {
                            // Trouver les questions correspondantes dans le sondage
                            const enrichedAnswers: EnrichedSurveyAnswer[] = response.answers.map(answer => {
                                const question = response.survey_id.questions.find(q => q._id === answer.question_id)
                                if (!question) {
                                    return null
                                }
                                return {
                                    question,
                                    value: answer.value
                                }
                            }).filter((answer): answer is EnrichedSurveyAnswer => answer !== null)

                            return {
                                _id: response._id,
                                survey: response.survey_id,
                                user: response.user_id || null,
                                anonymous: response.anonymous,
                                answers: enrichedAnswers,
                                created_at: response.created_at
                            }
                        })

                        // Vérifier que chaque réponse a les données nécessaires
                        const validResponses = transformedResponses.filter(response => {
                            // Vérifier que la réponse est valide (anonyme ou avec un utilisateur)
                            const isValid = response && response.survey && response.survey._id && (
                                response.anonymous || (response.user && response.user.name)
                            );
                            if (!isValid) {
                            }
                            return isValid;
                        });
                        allResponses.push(...validResponses)
                    }
                }

                // 3. Trier par date de création et garder les 5 plus récentes
                const sortedResponses = allResponses.sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ).slice(0, 5)

                setResponses(sortedResponses)
            } catch (error) {
                console.error('Erreur lors de la récupération des réponses:', error)
                toast.error('Une erreur est survenue lors de la récupération des réponses')
            } finally {
                setIsLoading(false)
            }
        }

        fetchResponses()
    }, [])

    return { responses, isLoading }
} 