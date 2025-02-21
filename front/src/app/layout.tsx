import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YForm - Créez vos sondages",
  description: "Plateforme de création et gestion de sondages",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />        {/* Header présent sur toutes les pages */}
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />      {/* Composant de notification global */}
      </body>
    </html>
  );
}


