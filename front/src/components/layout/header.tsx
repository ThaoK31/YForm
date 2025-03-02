"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Info, ClipboardList, MessageSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Logo } from "@/components/ui/logo"
import { UserNav } from "@/components/layout"

const getNavItems = (isLoggedIn: boolean) => [
  ...(isLoggedIn ? [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Mes sondages",
      href: "/surveys",
      icon: ClipboardList
    },
    {
      title: "Mes réponses",
      href: "/responses",
      icon: MessageSquare
    }
  ] : []),
  {
    title: "À propos",
    href: "/about",
    icon: Info
  }
]

export function Header() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const navItems = getNavItems(!!user)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-14 items-center">
          <Link href={user ? "/dashboard" : "/"} className="mr-6">
            <Logo />
          </Link>

          {!isLoading && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center transition-colors hover:text-foreground/80",
                      isActive ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          )}

          <div className="ml-auto flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : user ? (
              <UserNav user={user} />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Inscription</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}