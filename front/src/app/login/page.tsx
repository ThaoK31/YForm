import Link from "next/link"
import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour accéder à vos sondages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Chargement...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
