"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { submitResponse } from "@/lib/api/responses"
import { SurveyResponse, EnrichedResponseData } from "@/lib/types/api"
import { User } from "@/lib/types/user"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

interface ResponseFormProps {
  survey: SurveyResponse
  user: User | null
  existingResponse?: EnrichedResponseData | null
}

export function ResponseForm({ survey, user, existingResponse }: ResponseFormProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les réponses existantes si on est en mode modification
  useEffect(() => {
    if (existingResponse) {
      const initialAnswers: Record<string, string> = {}
      existingResponse.answers.forEach(answer => {
        initialAnswers[answer.question._id] = answer.value
      })
      setAnswers(initialAnswers)
    }
  }, [existingResponse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour répondre au sondage",
        variant: "destructive",
      })
      return
    }

    // Vérifier que toutes les questions ont une réponse
    const unansweredQuestions = survey.questions.filter(
      (question) => !answers[question._id]
    )

    if (unansweredQuestions.length > 0) {
      toast({
        title: "Erreur",
        description: "Veuillez répondre à toutes les questions",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour répondre au sondage",
          variant: "destructive",
        })
        return
      }

      const formattedAnswers = survey.questions.map((question) => ({
        question_id: question._id,
        value: answers[question._id],
      }))

      // Utiliser toujours submitResponse, que ce soit pour une création ou une modification
      const result = await submitResponse(token, {
        survey_id: survey._id,
        answers: formattedAnswers,
      })

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
        description: existingResponse 
          ? "Votre réponse a été mise à jour"
          : "Votre réponse a été enregistrée",
      })

      router.push("/responses")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre réponse",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {survey.questions.map((question, index) => (
        <div key={question._id} className="space-y-4">
          {index > 0 && <Separator className="my-4" />}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              {index + 1}. {question.text}
            </Label>
            {question.type === "open" ? (
              <Input
                value={answers[question._id] || ""}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                placeholder="Votre réponse..."
              />
            ) : question.type === "mcq" ? (
              <RadioGroup
                value={answers[question._id] || ""}
                onValueChange={(value) => handleAnswerChange(question._id, value)}
              >
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question._id}-${optionIndex}`} />
                    <Label htmlFor={`${question._id}-${optionIndex}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <RadioGroup
                value={answers[question._id] || ""}
                onValueChange={(value) => handleAnswerChange(question._id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${question._id}-yes`} />
                  <Label htmlFor={`${question._id}-yes`}>Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${question._id}-no`} />
                  <Label htmlFor={`${question._id}-no`}>Non</Label>
                </div>
              </RadioGroup>
            )}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours..." : existingResponse ? "Mettre à jour" : "Envoyer"}
      </Button>
    </form>
  )
}
