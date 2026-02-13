import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#0f172a0f] bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Arman Ebadi
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#leistungen" className="hover:text-black">
            Leistungen
          </a>
          <a href="#ablauf" className="hover:text-black">
            Ablauf
          </a>
          <a href="#ueber-mich" className="hover:text-black">
            Über mich
          </a>
          <a href="/anfrage" className="hover:text-black">
            Anfrage
          </a>
        </nav>
        <Link
          href="/anfrage"
          className="rounded-full border border-black px-5 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
        >
          Projekt anfragen
        </Link>
      </div>
    </header>
  )
}
