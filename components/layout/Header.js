import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-bdr px-6 py-3 sticky top-0 z-[100] flex justify-between items-center">
      <Link href="../../funtainment.html" className="font-playfair text-xl font-bold no-underline text-ink">
        LLOS<span className="text-llos">.ai</span>
      </Link>
      <nav className="flex gap-5 items-center">
        <Link href="../../home.html" className="text-[13px] font-medium text-muted no-underline transition-colors hover:text-llos">
          Home
        </Link>
        <Link href="../design/index.html" className="text-[13px] font-medium text-muted no-underline transition-colors hover:text-llos">
          Design
        </Link>
      </nav>
    </header>
  );
}
