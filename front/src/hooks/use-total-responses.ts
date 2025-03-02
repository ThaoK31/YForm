import { useState, useEffect } from "react"
import { getTotalResponses } from "@/lib/api/responses"
import { useAuth } from "./use-auth"
import { toast } from "@/hooks/use-toast"
import Cookies from "js-cookie"

export function useTotalResponses() {
  const { user } = useAuth()
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTotal = async () => {
      if (!user) return

      try {
        const token = Cookies.get("token")
        if (!token) {
          toast({
            title: "Erreur",
            description: "Vous devez être connecté pour voir le total des réponses",
            variant: "destructive",
          })
          return
        }

        const result = await getTotalResponses(token)
        if (result.error) {
          toast({
            title: "Erreur",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        setTotal(result.data || 0)
      } catch (error) {
        console.error("Erreur lors de la récupération du total des réponses:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la récupération du total des réponses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTotal()
  }, [user])

  return { total, isLoading }
} 