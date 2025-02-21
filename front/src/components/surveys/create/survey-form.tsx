"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { createSurvey, updateSurvey } from "@/lib/api/survey"
import { useAuth } from "@/hooks/use-auth"
import { QuestionType, CreateSurveyData } from "@/lib/types/survey"
import { SurveyTitle } from "@/components/surveys/create/survey-title"
import { QuestionList } from "@/components/surveys/create/question-list"
import { SurveyResponse } from "@/lib/types/api"

const questionSchema = z.object({
  text: z.string().min(1, "La question est requise"),
  type: z.enum(["open", "mcq", "yes/no"] as const),
  options: z.array(z.string()).default([]),
})

const formSchema = z.object({
  name: z.string().min(1, "Le nom du sondage est requis"),
  questions: z.array(questionSchema).min(1, "Au moins une question est requise"),
})

export type FormValues = z.infer<typeof formSchema>

interface SurveyFormProps {
  initialData?: SurveyResponse
  onCancel?: () => void
  mode?: "create" | "edit"
}

export function SurveyForm({ initialData, onCancel, mode = "create" }: SurveyFormProps) {
  const router = useRouter()
  const { user } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      questions: initialData?.questions || [{ text: "", type: "open", options: [] }],
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      if (!user) {
        toast.error("Vous devez être connecté pour créer un sondage")
        return
      }

      const surveyData: CreateSurveyData = {
        name: values.name,
        questions: values.questions
      }

      const response = mode === "create" 
        ? await createSurvey(surveyData)
        : await updateSurvey(initialData?._id || "", surveyData)
      
      if (response.error) {
        toast.error(response.error)
        return
      }

      if (!response.data) {
        toast.error(`Une erreur est survenue lors de la ${mode === "create" ? "création" : "modification"} du sondage`)
        return
      }

      toast.success(mode === "create" ? "Sondage créé avec succès" : "Sondage modifié avec succès")
      router.push(`/surveys/${response.data._id}`)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`)
      } else {
        toast.error(`Une erreur inattendue est survenue lors de la ${mode === "create" ? "création" : "modification"} du sondage`)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
        <SurveyTitle form={form} />
        <QuestionList form={form} />
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit">
            {mode === "create" ? "Publier le sondage" : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </Form>
  )
}