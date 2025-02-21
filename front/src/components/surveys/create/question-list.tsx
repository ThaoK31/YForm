import { UseFormReturn, useFieldArray } from "react-hook-form"
import { FormValues } from "./survey-form"
import { QuestionCard } from "@/components/surveys/create/question-card"

interface QuestionListProps {
  form: UseFormReturn<FormValues>
}

export function QuestionList({ form }: QuestionListProps) {
  const { fields, append, remove } = useFieldArray({
    name: "questions",
    control: form.control,
  })

  const handleAdd = () => {
    append({ text: "", type: "open", options: [] })
  }

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <QuestionCard
          key={field.id}
          form={form}
          index={index}
          onRemove={() => remove(index)}
          onAdd={handleAdd}
        />
      ))}
    </div>
  )
} 