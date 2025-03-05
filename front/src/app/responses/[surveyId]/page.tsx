"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSurveyById } from "@/lib/api/survey"
import { getSurveyResponses } from "@/lib/api/responses"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { SurveyResponse, EnrichedResponseData } from "@/lib/types/api"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Cookies from "js-cookie"
import { User } from "lucide-react"

export default function ResponsesPage() {
  const params = useParams()
  const surveyId = params.surveyId as string
  const { user } = useAuth()
  const [survey, setSurvey] = useState<SurveyResponse | null>(null)
  const [responses, setResponses] = useState<EnrichedResponseData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const token = Cookies.get("token")
        if (!token) {
          toast({
            title: "Erreur",
            description: "Vous devez être connecté pour voir les réponses",
            variant: "destructive",
          })
          return
        }

        // Récupérer les informations du sondage
        const surveyResult = await getSurveyById(surveyId)
        if (surveyResult.error || !surveyResult.data) {
          toast({
            title: "Erreur",
            description: surveyResult.error || "Impossible de récupérer le sondage",
            variant: "destructive",
          })
          return
        }
        setSurvey(surveyResult.data)

        // Récupérer les réponses
        const responsesResult = await getSurveyResponses(token, surveyId)
        if (responsesResult.error || !responsesResult.data) {
          toast({
            title: "Erreur",
            description: responsesResult.error || "Impossible de récupérer les réponses",
            variant: "destructive",
          })
          return
        }

        // Transformer les réponses pour avoir la structure enrichie
        const enrichedResponses = responsesResult.data.map(response => ({
          _id: response._id,
          survey: response.survey_id,
          user: response.user_id || null,
          anonymous: response.anonymous,
          answers: response.answers.map(answer => {
            const question = response.survey_id.questions.find(q => q._id === answer.question_id)
            if (!question) return null
            return {
              question,
              value: answer.value
            }
          }).filter((a): a is NonNullable<typeof a> => a !== null),
          created_at: response.created_at
        }))

        setResponses(enrichedResponses)
      } catch (error) {
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
  }, [user, surveyId])

  if (!user) {
    return null
  }

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
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Ce sondage n'existe pas ou vous n'avez pas les droits pour y accéder.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{survey.name}</h1>
        <p className="text-muted-foreground">
          {responses.length} réponse{responses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {responses.length > 0 ? (
        <div className="grid gap-6">
          {responses.map((response) => (
            <Card key={response._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {response.user ? response.user.name : (
                      <span className="flex items-center text-muted-foreground">
                        <User className="mr-2 text-muted-foreground h-4 w-4" />
                        Réponse anonyme
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(response.created_at), "PPP 'à' HH:mm", { locale: fr })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {response.answers.map((answer, index) => (
                    <div key={answer.question._id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="space-y-2">
                        <h3 className="font-medium">{answer.question.text}</h3>
                        <p className="text-muted-foreground">{answer.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune réponse n'a encore été soumise pour ce sondage.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
