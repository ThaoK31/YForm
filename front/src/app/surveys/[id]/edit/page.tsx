"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SurveyResponse } from "@/lib/types/api"
import { getSurveyById } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { SurveyForm } from "@/components/surveys/create/survey-form"

export default function EditSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [survey, setSurvey] = useState<SurveyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!user) return

      try {
        const response = await getSurveyById(params.id as string)
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

        setSurvey(response.data)
      } catch (error) {
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
  }, [params.id, user])

  const handleCancel = () => {
    router.back()
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
      <div className="container max-w-2xl mx-auto py-8">
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Modifier le sondage</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <SurveyForm 
            initialData={survey}
            onCancel={handleCancel}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  )
}