"use client";

import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/client/session";
import { useSaved } from "@/lib/client/saved";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Find a home" },
  { href: "/status", label: "Track application" },
];

export function PublicHeader({ active }: { active?: string }) {
  const { user, ready } = useSession();
  const { count } = useSaved();

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
          <Link
            href="/account/saved"
            className="btn btn-quiet btn-sm"
            aria-label={`Saved listings${count ? ` (${count})` : ""}`}
          >
            <Icon name="heart" size={16} />
            {count > 0 && <span>{count}</span>}
          </Link>
          {ready && user ? (
            <LinkButton href="/account/profile" variant="ghost" size="sm">
              <Icon name="users" size={15} /> {user.fullName.split(" ")[0]}
            </LinkButton>
          ) : (
            <LinkButton href="/account/login" variant="ghost" size="sm">
              Sign in
            </LinkButton>
          )}
          <LinkButton href="/listings" variant="primary" size="sm">
            Find a home
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
