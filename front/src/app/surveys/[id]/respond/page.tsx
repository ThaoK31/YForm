"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSurveyById } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { SurveyResponse } from "@/lib/types/api"
import { ResponseForm } from "@/components/surveys/respond/response-form"

export default function RespondPage() {
  const params = useParams()
  const { user } = useAuth()
  const [survey, setSurvey] = useState<SurveyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        console.log("ID du sondage :", params.id)
        const response = await getSurveyById(params.id as string)
        console.log("Réponse de l'API :", response)
        if (response.error) {
          toast({
            title: "Erreur",
            description: response.error,
            variant: "destructive",
          })
          return
        }
        
        if (!response.data) {
          toast({
            title: "Erreur",
            description: "Impossible de charger le sondage",
            variant: "destructive",
          })
          return
        }

        console.log("Données du sondage chargées :", response.data)
        setSurvey(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement du sondage :", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la récupération du sondage",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurvey()
  }, [params.id])

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
          <CardTitle>{survey.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponseForm survey={survey} user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
