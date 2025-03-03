"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSurveyById } from "@/lib/api/survey"
import { getResponseById } from "@/lib/api/responses"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { SurveyResponse, EnrichedResponseData } from "@/lib/types/api"
import { ResponseForm } from "@/components/surveys/respond/response-form"
import Cookies from "js-cookie"

export default function RespondPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [survey, setSurvey] = useState<SurveyResponse | null>(null)
  const [existingResponse, setExistingResponse] = useState<EnrichedResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le sondage
        const surveyResponse = await getSurveyById(params.id as string)
        if (surveyResponse.error) {
          toast({
            title: "Erreur",
            description: surveyResponse.error,
            variant: "destructive",
          })
          return
        }
        
        if (!surveyResponse.data) {
          toast({
            title: "Erreur",
            description: "Impossible de charger le sondage",
            variant: "destructive",
          })
          return
        }

        setSurvey(surveyResponse.data)

        // Si on a un response_id ET que l'utilisateur est connecté, récupérer la réponse existante
        const responseId = searchParams.get('response_id')
        if (responseId && user) {
          const token = Cookies.get('token')
          if (!token) {
            toast({
              title: "Erreur",
              description: "Vous devez être connecté pour modifier une réponse",
              variant: "destructive",
            })
            return
          }

          const responseData = await getResponseById(token, responseId)
          if (responseData.error) {
            toast({
              title: "Erreur",
              description: responseData.error,
              variant: "destructive",
            })
            return
          }

          if (responseData.data && surveyResponse.data) {
            // Transformer la réponse au format enrichi
            const enrichedResponse: EnrichedResponseData = {
              _id: responseData.data._id,
              survey: responseData.data.survey_id,
              user: responseData.data.user_id || null,
              answers: responseData.data.answers.map(answer => {
                const question = surveyResponse.data?.questions.find(q => q._id === answer.question_id)
                if (!question) {
                  return null
                }
                return {
                  question,
                  value: answer.value
                }
              }).filter((answer): answer is { question: any; value: string } => answer !== null),
              created_at: responseData.data.created_at
            }
            setExistingResponse(enrichedResponse)
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la récupération des données",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, searchParams, user])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Ce sondage n'existe pas ou vous n'avez pas les droits pour y accéder.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{existingResponse ? "Modifier votre réponse" : survey.name}</CardTitle>
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              Vous n'êtes pas connecté. Vous pouvez répondre anonymement ou vous <a href="/login" className="text-primary hover:underline">connecter</a> pour associer votre réponse à votre compte.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ResponseForm 
            survey={survey} 
            user={user} 
            existingResponse={existingResponse}
          />
        </CardContent>
      </Card>
    </div>
  )
}
