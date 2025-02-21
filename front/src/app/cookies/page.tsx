import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CookiesPage() {
  return (
    <div className="container flex justify-center py-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Politique des Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Qu'est-ce qu'un cookie ?</h3>
              <p className="text-muted-foreground">
                Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. 
                Ils sont essentiels pour le bon fonctionnement du site et l'amélioration de votre expérience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cookies utilisés</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Objectif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>token</TableCell>
                    <TableCell>Essentiel</TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Authentification</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>theme</TableCell>
                    <TableCell>Fonctionnalité</TableCell>
                    <TableCell>1 an</TableCell>
                    <TableCell>Préférences d'affichage</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Gestion des cookies</h3>
              <p className="text-muted-foreground">
                Vous pouvez contrôler les cookies via les paramètres de votre navigateur. 
                Notez que la désactivation de certains cookies peut limiter votre accès à certaines fonctionnalités du site.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Pour toute question : contact@yform.com</p>
              <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 