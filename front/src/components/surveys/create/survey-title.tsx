import { UseFormReturn } from "react-hook-form"
import { Card } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormValues } from "./survey-form"

interface SurveyTitleProps {
  form: UseFormReturn<FormValues>
}

export function SurveyTitle({ form }: SurveyTitleProps) {
  return (
    <Card className="p-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="Nom du sondage"
                {...field}
                className="text-2xl border-none px-0 focus-visible:ring-0"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  )
} 