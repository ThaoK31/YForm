import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, ClipboardList, Users, LineChart } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "À propos | YForm",
  description: "Découvrez YForm, la plateforme de sondages simple et efficace",
}

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="flex flex-col items-center justify-center w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-16 text-center">
            {/* Hero Section */}
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                À propos de YForm
              </h1>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Une plateforme de sondages moderne et intuitive conçue pour simplifier la création,
                la gestion et l'analyse de vos enquêtes
              </p>
            </div>

            {/* Features Grid */}
            <div className="w-full max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <ClipboardList className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Création Facile</h3>
                    <p className="text-muted-foreground">
                      Créez des sondages personnalisés en quelques clics avec notre interface intuitive.
                      Ajoutez facilement différents types de questions et personnalisez l'apparence.
                    </p>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Collaboration</h3>
                    <p className="text-muted-foreground">
                      Partagez vos sondages facilement et collectez les réponses en temps réel.
                      Travaillez en équipe et gérez les permissions d'accès.
                    </p>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <LineChart className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Analyse des Résultats</h3>
                    <p className="text-muted-foreground">
                      Visualisez et analysez les réponses avec des graphiques clairs et détaillés.
                      Exportez les données pour une analyse approfondie.
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* CTA Section */}
            <div className="w-full max-w-3xl">
              <div className="flex flex-col items-center space-y-4 bg-muted/50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-semibold">Prêt à commencer ?</h2>
                <p className="text-muted-foreground max-w-[600px]">
                  Rejoignez des milliers d'utilisateurs qui font confiance à YForm pour leurs sondages
                </p>
                <Button size="lg" asChild>
                  <Link href="/surveys/create" className="flex items-center">
                    Créer un sondage
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
