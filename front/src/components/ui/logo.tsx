import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/favicon.png"
        alt="YForm Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="font-bold text-xl tracking-tight">YForm</span>
    </div>
  )
}

export default function LogoWithTagline() {
  return (
    <div className="flex items-center gap-2">
      <Logo />
      <span className="text-sm text-muted-foreground font-medium border-l pl-2">
        Sondez, Analysez, Décidez
      </span>
    </div>
  )
} 