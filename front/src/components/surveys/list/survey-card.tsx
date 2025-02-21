import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SurveyResponse } from "@/lib/types/api"
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

interface SurveyCardProps {
  survey: SurveyResponse & { responseCount?: number }
  onDelete: (id: string) => Promise<void>
  onCopyLink: (id: string) => void
}

export function SurveyCard({ survey, onDelete, onCopyLink }: SurveyCardProps) {
  return (
    <div className="block p-4 rounded-lg border hover:bg-accent transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{survey.name}</div>
          <div className="text-sm text-muted-foreground mb-2">
            {survey.questions.length} question{survey.questions.length > 1 ? 's' : ''} 
            {survey.responseCount !== undefined && ` • ${survey.responseCount} réponse${survey.responseCount > 1 ? 's' : ''}`}
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/surveys/${survey._id}`}>
                Voir les détails
              </Link>
            </Button>
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
                  <AlertDialogAction onClick={() => onDelete(survey._id)}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="space-x-2">
          <Button variant="secondary" asChild>
            <Link href={`/surveys/${survey._id}/respond`}>
              Répondre
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onCopyLink(survey._id)}>
            <Link2 className="h-4 w-4 mr-1" />
            Copier le lien
          </Button>
        </div>
      </div>
    </div>
  )
} 