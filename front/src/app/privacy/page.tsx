import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPage() {
  return (
    <div className="container flex justify-center py-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Politique de Confidentialité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Données collectées</h3>
              <p className="text-muted-foreground">
                Nous collectons uniquement les informations nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Nom et prénom</li>
                <li>Adresse e-mail</li>
                <li>Réponses aux sondages</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">2. Utilisation des données</h3>
              <p className="text-muted-foreground">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>Gérer votre compte</li>
                <li>Permettre la création de sondages</li>
                <li>Améliorer nos services</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">3. Protection des données</h3>
              <p className="text-muted-foreground">
                Nous utilisons des mesures de sécurité avancées pour protéger vos informations. 
                Nous ne vendons ni ne partageons vos données personnelles avec des tiers.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">4. Vos droits</h3>
              <p className="text-muted-foreground">
                Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles. 
                Contactez-nous pour exercer ces droits.
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