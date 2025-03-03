"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRecentResponses } from "@/hooks/use-recent-responses"
import { useUserResponses } from "@/hooks/use-user-responses"
import { EnrichedResponseData } from "@/lib/types/api"
import { Skeleton } from "@/components/ui/skeleton"
import { FileSpreadsheet, Send, Pencil, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { deleteResponse } from "@/lib/api/responses"
import { toast } from "@/hooks/use-toast"
import Cookies from "js-cookie"
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

export default function ResponsesPage() {
  const { responses: receivedResponses, isLoading: receivedLoading } = useRecentResponses()
  const { responses: submittedResponses, isLoading: submittedLoading, mutate: mutateSubmittedResponses } = useUserResponses()
  const [deletingResponseId, setDeletingResponseId] = useState<string | null>(null)

  const handleDelete = async (responseId: string) => {
    try {
      setDeletingResponseId(responseId)
      const token = Cookies.get('token')
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour supprimer une réponse",
          variant: "destructive",
        })
        return
      }

      const result = await deleteResponse(token, responseId)
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
        description: "Votre réponse a été supprimée",
      })

      // Rafraîchir la liste des réponses
      mutateSubmittedResponses()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la réponse",
        variant: "destructive",
      })
    } finally {
      setDeletingResponseId(null)
    }
  }

  const ResponseList = ({ responses, isLoading, emptyMessage, showEditButton = false }: { 
    responses: EnrichedResponseData[], 
    isLoading: boolean,
    emptyMessage: string,
    showEditButton?: boolean
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (responses.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {responses.map((response) => {
          // Vérifier si c'est une réponse anonyme
          const isAnonymous = response.anonymous || !response.user;
          
          return (
            <div key={response._id} className="block">
              <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted">
                <Link 
                  href={`/responses/${response.survey._id}`}
                  className="flex items-center space-x-4 flex-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-semibold text-primary">
                      {isAnonymous ? "?" : response.user!.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{response.survey.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAnonymous  
                        ? `Utilisateur anonyme - ${format(new Date(response.created_at), "PPP 'à' HH:mm", { locale: fr })}`
                        : `${response.user!.name} - ${format(new Date(response.created_at), "PPP 'à' HH:mm", { locale: fr })}`
                      }
                    </p>
                  </div>
                </Link>
                
                {showEditButton && !isAnonymous && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/surveys/${response.survey._id}/respond?response_id=${response._id}`}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Modifier
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingResponseId === response._id}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingResponseId === response._id ? "Suppression..." : "Supprimer"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer votre réponse</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer votre réponse au sondage "{response.survey.name}" ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(response._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Réponses</h1>
          <p className="text-muted-foreground">
            Consultez les réponses reçues et soumises
          </p>
        </div>

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Réponses reçues
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Réponses envoyées
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Réponses reçues
                </CardTitle>
                <CardDescription>
                  Liste des réponses reçues à vos sondages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponseList 
                  responses={receivedResponses}
                  isLoading={receivedLoading}
                  emptyMessage="Aucune réponse reçue à vos sondages"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Réponses envoyées
                </CardTitle>
                <CardDescription>
                  Liste des réponses que vous avez soumises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponseList 
                  responses={submittedResponses}
                  isLoading={submittedLoading}
                  emptyMessage="Vous n'avez pas encore répondu à des sondages"
                  showEditButton={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 