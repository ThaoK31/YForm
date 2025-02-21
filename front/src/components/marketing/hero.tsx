"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative isolate pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Créez des sondages qui{" "}
            <span className="text-primary">engagent</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-xl mx-auto">
            YForm vous permet de créer, partager et analyser des sondages en toute simplicité. 
            Obtenez des insights précieux de votre audience en quelques clics.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/register">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">
                En savoir plus
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 