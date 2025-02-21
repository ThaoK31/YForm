"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, User, Settings, LogOut, ClipboardList, MessageSquare, Info } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Logo } from "@/components/ui/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const { user, isLoading, signOut } = useAuth()
  const navItems = getNavItems(!!user)
  
  console.log('Current user:', user)

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {user.name || 'Mon compte'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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