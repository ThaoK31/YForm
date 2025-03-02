import { UseFormReturn } from "react-hook-form"
import { Card } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Image, Type, FileText, Video, Copy, MoreVertical, GripVertical } from "lucide-react"
import { FormValues } from "@/components/surveys/create/survey-form"
import { QuestionType } from "@/lib/types/survey"
import { QuestionOptions } from "@/components/surveys/create/question-options"

interface QuestionCardProps {
  form: UseFormReturn<FormValues>
  index: number
  onRemove: () => void
  onAdd?: () => void
  onDuplicate?: () => void
}

export function QuestionCard({ form, index, onRemove, onAdd, onDuplicate }: QuestionCardProps) {
  const handleTypeChange = (value: QuestionType) => {
    if (value === "mcq" && form.getValues(`questions.${index}.options`).length === 0) {
      form.setValue(`questions.${index}.options`, ["Option 1"])
    } else if (value === "yes/no" || value === "open") {
      form.setValue(`questions.${index}.options`, [])
    }
    form.setValue(`questions.${index}.type`, value)
  }

  const duplicateQuestion = () => {
      const currentQuestion = form.getValues(`questions.${index}`)
      if (onAdd) {
        onAdd()
        const newIndex = form.getValues("questions").length - 1
        form.setValue(`questions.${newIndex}`, currentQuestion)
      } else if (onDuplicate) {
        onDuplicate()
      }
  }

  return (
    <div className="relative group">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="cursor-move mr-2 opacity-30 hover:opacity-100">
              <GripVertical className="h-5 w-5" />
            </div>
            <FormField
              control={form.control}
              name={`questions.${index}.text`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Question sans titre" 
                      {...field}
                      className="text-lg border-none px-0 focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => handleTypeChange(value as QuestionType)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Réponse libre</SelectItem>
                    <SelectItem value="mcq">Choix multiple</SelectItem>
                    <SelectItem value="yes/no">Oui/Non</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch(`questions.${index}.type`) === "mcq" && (
            <QuestionOptions form={form} index={index} />
          )}
        </div>
      </Card>

      {/* Panneau d'options de la question */}
      <div className="absolute right-0 top-0 h-full translate-x-full pl-4 hidden group-hover:block">
        <div className="bg-background rounded-lg border shadow-sm p-2 space-y-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onAdd}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={duplicateQuestion}
          >
            <Copy className="h-4 w-4" />
          </Button>

          <div className="h-px w-full bg-border" />
          <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <Image className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <FileText className="h-4 w-4" />
          </Button>
          <div className="h-px w-full bg-border" />
          <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 