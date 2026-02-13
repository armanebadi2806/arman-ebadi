import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#0f172a0f] bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-10 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <p>© {new Date().getFullYear()} Arman Ebadi</p>
          <p>Antwort innerhalb von 24 Stunden.</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link href="#">Impressum</Link>
          <Link href="#">Datenschutz</Link>
          <Link href="mailto:info@example.com">info@example.com</Link>
        </div>
      </div>
    </footer>
  )
}
