"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SurveyResponse } from "@/lib/types/api"
import { getUserSurveys, deleteSurvey, getSurveyResponseCount } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SurveyList } from "@/components/surveys/list"
import { getUserResponses } from "@/lib/api/responses"
import Cookies from "js-cookie"

export default function SurveysPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<(SurveyResponse & { responseCount?: number; userResponseId?: string | null })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const copyResponseLink = (survey_id: string) => {
    if (!survey_id) {
      console.error("ID du sondage manquant", survey_id)
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien : ID du sondage manquant",
        variant: "destructive",
      })
      return
    }

    try {
      const link = `${window.location.origin}/surveys/${survey_id}/respond`
      console.log("Lien généré :", link)
      navigator.clipboard.writeText(link)
      toast({
        title: "Succès",
        description: "Lien de réponse copié !",
      })
    } catch (error) {
      console.error("Erreur lors de la copie du lien :", error)
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return

      try {
        // Récupérer les sondages
        const surveysResult = await getUserSurveys()
        if (surveysResult.error) {
          toast({
            title: "Erreur",
            description: surveysResult.error,
            variant: "destructive",
          })
          return
        }

        // Récupérer les réponses de l'utilisateur
        const token = Cookies.get('token')
        if (!token) {
          toast({
            title: "Erreur",
            description: "Token d'authentification manquant",
            variant: "destructive",
          })
          return
        }

        const responsesResult = await getUserResponses(token)
        if (responsesResult.error) {
          toast({
            title: "Erreur",
            description: responsesResult.error,
            variant: "destructive",
          })
          return
        }

        if (surveysResult.data) {
          // Récupérer les compteurs et ajouter les IDs des réponses
          const surveysWithData = await Promise.all(
            surveysResult.data.map(async (survey) => {
              const countResult = await getSurveyResponseCount(survey._id)
              const userResponse = responsesResult.data?.find(
                response => response && response.survey_id && response.survey_id._id === survey._id
              )
              console.log('Checking survey:', survey._id, 'Response:', userResponse)
              return {
                ...survey,
                responseCount: countResult.data || 0,
                userResponseId: userResponse?._id || null
              }
            })
          )
          setSurveys(surveysWithData)
        }
      } catch (error) {
        console.error('Erreur complète:', error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la récupération des sondages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveys()
  }, [user])

  const handleDelete = async (survey_id: string) => {
    try {
      const result = await deleteSurvey(survey_id)
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
        return
      }
      
      setSurveys(surveys.filter(survey => survey._id !== survey_id))
      toast({
        title: "Succès",
        description: "Le sondage a été supprimé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du sondage",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes sondages</h1>
        <Button asChild>
          <Link href="/surveys/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un sondage
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : surveys.length > 0 ? (
              <SurveyList
                surveys={surveys}
                onDelete={handleDelete}
                onCopyLink={copyResponseLink}
                showViewAll={false}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  Vous n'avez pas encore créé de sondage
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
