"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SurveyResponse } from "@/lib/types/api"
import { getUserSurveys, deleteSurvey } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import { PlusCircle, ClipboardList, LineChart } from "lucide-react"
import { useRecentResponses } from "@/hooks/use-recent-responses"
import { toast } from "@/hooks/use-toast"
import { StatsCard, RecentResponses, RecentSurveys } from "@/components/dashboard"

export default function DashboardPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<SurveyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { responses, isLoading: responsesLoading } = useRecentResponses()

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

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return

      try {
        const result = await getUserSurveys()
        if (result.error) {
          toast({
            title: "Erreur",
            description: result.error,
            variant: "destructive",
          })
          return
        }
        if (result.data) {
          setSurveys(result.data)
        }
      } catch (error) {
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

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button asChild>
          <Link href="/surveys/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un sondage
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 justify-center">
          <StatsCard
            title="Total des sondages"
            value={surveys.length}
            description={surveys.length === 0 ? "Aucun sondage" : surveys.length === 1 ? "1 sondage" : `${surveys.length} sondages`}
            icon={ClipboardList}
            href="/surveys"
          />
          <StatsCard
            title="Réponses reçues"
            value={248}
            description="+22% par rapport au mois dernier"
            icon={LineChart}
          />
        </div>

        <RecentSurveys
          surveys={surveys}
          isLoading={isLoading}
          onDelete={handleDelete}
          onCopyLink={copyResponseLink}
        />

        <RecentResponses
          responses={responses}
          isLoading={responsesLoading}
        />
      </div>
    </div>
  )
} 