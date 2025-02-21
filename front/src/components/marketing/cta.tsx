"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-primary/5">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à commencer ?
            <br />
            Créez votre premier sondage gratuitement
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Rejoignez des milliers d'utilisateurs qui font confiance à YForm pour leurs sondages.
            Pas de carte de crédit requise.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link href="/register">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 