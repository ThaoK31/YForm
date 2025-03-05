"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SurveyResponse } from "@/lib/types/api"
import { getSurveyById, deleteSurvey } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, BarChart2, Trash, Link2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [survey, setSurvey] = useState<SurveyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const copyResponseLink = () => {
    if (!survey?._id) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien : ID du sondage manquant",
        variant: "destructive",
      })
      return
    }

    try {
      const link = `${window.location.origin}/surveys/${survey._id}/respond`
      navigator.clipboard.writeText(link)
      toast({
        title: "Succès",
        description: "Lien de réponse copié !",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!survey?._id) return

    try {
      const result = await deleteSurvey(survey._id)
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Succès",
        description: "Le sondage a été supprimé",
      })
      router.push("/surveys")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du sondage",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!user) return

      try {
        const response = await getSurveyById(params.id as string)
        if (response.error) {
          setError(response.error)
          toast({
            title: "Erreur",
            description: response.error,
            variant: "destructive",
          })
          return
        }
        
        if (!response.data) {
          setError("Impossible de charger le sondage")
          toast({
            title: "Erreur",
            description: "Impossible de charger le sondage",
            variant: "destructive",
          })
          return
        }

        setSurvey(response.data)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Une erreur est survenue"
        setError(message)
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurvey()
  }, [params.id, user])

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive">{error || "Sondage non trouvé"}</h1>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{survey.name}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" asChild>
            <Link href={`/surveys/${survey._id}/respond`}>
              Répondre
            </Link>
          </Button>
          <Button variant="outline" onClick={copyResponseLink}>
            <Link2 className="h-4 w-4 mr-1" />
            Copier le lien
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/surveys/${survey._id}/edit`}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/responses/${survey._id}`}>
            <BarChart2 className="h-4 w-4 mr-1" />
            Voir les réponses
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le sondage</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce sondage ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={question._id} className="space-y-2">
              <h3 className="font-medium">
                Question {index + 1}: {question.text}
              </h3>
              <p className="text-sm text-muted-foreground">
                Type: {question.type === 'open' ? 'Réponse libre' : question.type === 'mcq' ? 'Choix multiple' : 'Oui/Non'}
              </p>
              {question.type === 'mcq' && question.options && (
                <ul className="list-disc list-inside space-y-1">
                  {question.options.map((option, index) => (
                    <li key={`${question._id}-option-${index}`} className="text-sm">
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

