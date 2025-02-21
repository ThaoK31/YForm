import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { FormValues } from "./survey-form"

interface QuestionOptionsProps {
  form: UseFormReturn<FormValues>
  index: number
}

export function QuestionOptions({ form, index }: QuestionOptionsProps) {
  const options = form.watch(`questions.${index}.options`) as string[]

  const addOption = () => {
    const currentOptions = form.getValues(`questions.${index}.options`) as string[]
    form.setValue(`questions.${index}.options`, [...currentOptions, `Option ${currentOptions.length + 1}`])
  }

  const removeOption = (optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${index}.options`) as string[]
    form.setValue(
      `questions.${index}.options`,
      currentOptions.filter((_, i) => i !== optionIndex)
    )
  }

  return (
    <div className="space-y-2">
      {options.map((_, optionIndex) => (
        <div key={optionIndex} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name={`questions.${index}.options.${optionIndex}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeOption(optionIndex)}
            disabled={options.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addOption}
      >
        Ajouter une option
      </Button>
    </div>
  )
} 