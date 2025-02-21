"use client"

import { 
  ClipboardList, 
  Share2, 
  BarChart3, 
  Shield, 
  Zap,
  Users
} from "lucide-react"

const features = [
  {
    name: "Création intuitive",
    description: "Créez des sondages professionnels en quelques minutes avec notre interface simple et intuitive.",
    icon: ClipboardList
  },
  {
    name: "Partage facile",
    description: "Partagez vos sondages via email, lien direct ou intégrez-les sur votre site web.",
    icon: Share2
  },
  {
    name: "Analyses détaillées",
    description: "Visualisez les résultats en temps réel avec des graphiques clairs et des statistiques détaillées.",
    icon: BarChart3
  },
  {
    name: "Sécurisé",
    description: "Vos données sont protégées avec un chiffrement de bout en bout et des contrôles d'accès stricts.",
    icon: Shield
  },
  {
    name: "Performance optimale",
    description: "Une plateforme rapide et fiable, conçue pour gérer des milliers de réponses sans ralentissement.",
    icon: Zap
  },
  {
    name: "Collaboration d'équipe",
    description: "Travaillez en équipe sur vos sondages avec des rôles et permissions personnalisables.",
    icon: Users
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Tout ce dont vous avez besoin</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            La plateforme de sondage complète
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            YForm réunit tous les outils nécessaires pour créer, partager et analyser vos sondages efficacement.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
} 