import Link from "next/link"
import { Github } from "lucide-react"

import { siteConfig } from "@/lib/config"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const footerLinks = {
  legal: [
    { title: "Confidentialité", href: "/privacy" },
    { title: "CGU", href: "/terms" },
    { title: "Cookies", href: "/cookies" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-6">
        <div className="flex flex-col w-full">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="pl-4">
              <p className="text-sm text-muted-foreground">
                Créez et partagez des sondages en toute simplicité.
              </p>
            </div>

            <div className="flex items-end md:items-center">
              <ul className="flex gap-4 justify-end">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t" />
      <div className="container py-4">
        <div className="flex w-full">
          <div className="flex justify-between w-full items-center">
            <p className="text-sm text-muted-foreground pl-4">
              © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
            </p>
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
