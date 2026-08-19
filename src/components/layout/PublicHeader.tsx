import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LinkButton } from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Find a home" },
  { href: "/status", label: "Track application" },
];

export function PublicHeader({ active }: { active?: string }) {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <BrandMark />
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={active === l.href ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-cta">
          <LinkButton href="/account/login" variant="ghost" size="sm">
            Sign in
          </LinkButton>
          <LinkButton href="/listings" variant="primary" size="sm">
            Find a home
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
