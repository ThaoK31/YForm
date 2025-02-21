import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="container flex justify-center py-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Conditions Générales d'Utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Acceptation des conditions</h3>
              <p className="text-muted-foreground">
                En utilisant YForm, vous acceptez ces conditions d'utilisation. 
                Si vous ne les acceptez pas, veuillez ne pas utiliser notre service.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">2. Utilisation du service</h3>
              <p className="text-muted-foreground">
                YForm est une plateforme de création et de gestion de sondages. 
                Vous êtes responsable de :
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Maintenir la confidentialité de votre compte</li>
                <li>Fournir des informations exactes</li>
                <li>Utiliser le service de manière légale et appropriée</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">3. Propriété intellectuelle</h3>
              <p className="text-muted-foreground">
                Vous conservez vos droits sur le contenu que vous créez. 
                En l'utilisant sur notre plateforme, vous nous accordez le droit 
                de l'héberger et de le partager selon vos paramètres.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">4. Limitation de responsabilité</h3>
              <p className="text-muted-foreground">
                YForm n'est pas responsable des réponses aux sondages, 
                de la perte de données ou des dommages indirects résultant 
                de l'utilisation du service.
              </p>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
              <p>Pour toute question : contact@yform.com</p>
              <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 