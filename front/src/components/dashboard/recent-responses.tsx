import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { FileSpreadsheet } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EnrichedResponseData } from "@/lib/types/api"

interface RecentResponsesProps {
  responses: EnrichedResponseData[]
  isLoading: boolean
}

export function RecentResponses({ responses, isLoading }: RecentResponsesProps) {
  return (
    <Card>
      <CardHeader>
        <Link href="/responses" className="hover:text-foreground/80 transition-colors">
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Réponses récentes
          </CardTitle>
        </Link>
        <CardDescription>
          Consultez les dernières réponses à vos sondages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
        ) : (
          <div className="space-y-4">
            {responses.length > 0 ? (
              responses.map((response: EnrichedResponseData) => {
                if (!response?.survey?._id || !response?.user?.name) {
                  return null;
                }

                return (
                  <Link 
                    key={response._id} 
                    href={`/responses/${response.survey._id}`}
                    className="block"
                  >
                    <div className="flex items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-muted">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-lg font-semibold text-primary">
                          {response.user.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{response.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          a répondu à {response.survey.name} • {format(new Date(response.created_at), "PPP 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune réponse récente à vos sondages
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 