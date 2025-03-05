import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"
import { SurveyResponse } from "@/lib/types/api"
import { SurveyList } from "@/components/surveys/list"

interface RecentSurveysProps {
  surveys: (SurveyResponse & { 
    responseCount?: number;
    userResponseId?: string | null;
  })[]
  isLoading: boolean
  onDelete: (id: string) => Promise<void>
  onCopyLink: (id: string) => void
}

export function RecentSurveys({ surveys, isLoading, onDelete, onCopyLink }: RecentSurveysProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link href="/surveys" className="hover:text-foreground/80 transition-colors">
          <CardTitle className="text-sm font-medium">
            Sondages récents
          </CardTitle>
        </Link>
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : surveys.length > 0 ? (
          <SurveyList
            surveys={surveys}
            onDelete={onDelete}
            onCopyLink={onCopyLink}
            limit={5}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun sondage créé
          </div>
        )}
      </CardContent>
    </Card>
  )
} 