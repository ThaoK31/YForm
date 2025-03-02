"use client"

import { useTheme } from "@/lib/theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Monitor, Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { updateUser } from "@/lib/api/auth"
import { toast } from "@/hooks/use-toast"
import Cookies from "js-cookie"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour modifier votre profil",
          variant: "destructive",
        })
        return
      }

      const updates: {
        name?: string
        email?: string
        currentPassword?: string
        newPassword?: string
      } = {}

      if (formData.name !== user?.name) updates.name = formData.name
      if (formData.email !== user?.email) updates.email = formData.email
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Erreur",
            description: "Les mots de passe ne correspondent pas",
            variant: "destructive",
          })
          return
        }
        if (!formData.currentPassword) {
          toast({
            title: "Erreur",
            description: "Le mot de passe actuel est requis pour changer de mot de passe",
            variant: "destructive",
          })
          return
        }
        updates.currentPassword = formData.currentPassword
        updates.newPassword = formData.newPassword
      }

      // Vérifier qu'il y a des modifications à faire
      if (Object.keys(updates).length === 0) {
        toast({
          title: "Erreur",
          description: "Aucune modification à effectuer",
          variant: "destructive",
        })
        return
      }

      const result = await updateUser(token, updates)
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.data?.name && result.data?.email) {
        // Mettre à jour le formulaire avec les nouvelles données
        setFormData(prev => ({
          ...prev,
          name: result.data.name,
          email: result.data.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
        
        toast({
          title: "Succès",
          description: "Votre profil a été mis à jour",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application selon vos préférences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Thème</Label>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                  className="grid grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <RadioGroupItem value="light" id="light" className="sr-only" />
                    <Sun className="h-6 w-6" />
                    <span className="mt-2">Clair</span>
                  </Label>
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                    <Moon className="h-6 w-6" />
                    <span className="mt-2">Sombre</span>
                  </Label>
                  <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <RadioGroupItem value="system" id="system" className="sr-only" />
                    <Monitor className="h-6 w-6" />
                    <span className="mt-2">Système</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Modifiez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom d'utilisateur</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom d'utilisateur"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email"
                />
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Votre mot de passe actuel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Votre nouveau mot de passe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 