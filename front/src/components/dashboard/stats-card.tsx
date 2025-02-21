import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  href?: string
}

export function StatsCard({ title, value, description, icon: Icon, href }: StatsCardProps) {
  const CardWrapper = href ? "a" : "div"
  const cardProps = href ? { href, className: "hover:text-foreground/80 transition-colors" } : {}

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardWrapper {...cardProps}>
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
        </CardWrapper>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 