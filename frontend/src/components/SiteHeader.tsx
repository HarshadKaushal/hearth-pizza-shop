import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        <span className="coal" aria-hidden="true" />
        Hearth
      </Link>
      <p className="tagline">Neighborhood pizza, priced in the open.</p>
      <nav>
        <Link href="/">Menu</Link>
      </nav>
    </header>
  );
}
