import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SurveyResponse } from "@/lib/types/api"
import { SurveyCard } from "./survey-card"

interface SurveyListProps {
  surveys: (SurveyResponse & { responseCount?: number })[]
  onDelete: (id: string) => Promise<void>
  onCopyLink: (id: string) => void
  limit?: number
  showViewAll?: boolean
}

export function SurveyList({ 
  surveys, 
  onDelete, 
  onCopyLink, 
  limit,
  showViewAll = true
}: SurveyListProps) {
  const displayedSurveys = limit ? surveys.slice(0, limit) : surveys

  return (
    <div className="space-y-4">
      {displayedSurveys.map((survey) => (
        <SurveyCard
          key={survey._id}
          survey={survey}
          onDelete={onDelete}
          onCopyLink={onCopyLink}
        />
      ))}
      {showViewAll && surveys.length > (limit || 0) && (
        <Button variant="link" asChild className="w-full">
          <Link href="/surveys">Voir tous les sondages</Link>
        </Button>
      )}
    </div>
  )
} 