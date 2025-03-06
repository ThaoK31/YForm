"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"

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
  order: z.number().optional(),
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
      questions: initialData?.questions && initialData.questions.length > 0 
        ? initialData.questions.map(q => ({
            text: q.text,
            type: q.type,
            options: q.options || [],
            order: q.order || 0
          }))
        : [{ text: "", type: "open", options: [], order: 1 }],
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour créer un sondage"
        })
        return
      }

      const questionsWithOrder = values.questions.map((question, index) => ({
        ...question,
        order: question.order || index + 1
      }));
      
      const surveyData: CreateSurveyData = {
        name: values.name,
        questions: questionsWithOrder
      }

      const response = mode === "create" 
        ? await createSurvey(surveyData)
        : await updateSurvey(initialData?._id || "", surveyData)
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: response.error
        })
        return
      }

      if (!response.data) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Une erreur est survenue lors de la ${mode === "create" ? "création" : "modification"} du sondage`
        })
        return
      }

      toast({
        title: "Succès",
        description: mode === "create" ? "Sondage créé avec succès" : "Sondage modifié avec succès"
      })
      router.push(`/surveys/${response.data._id}`)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur: ${error.message || 'Une erreur inattendue est survenue'}`
      })
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