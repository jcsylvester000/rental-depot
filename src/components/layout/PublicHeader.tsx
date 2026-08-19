"use client";

import * as React from "react";
import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/client/session";
import { useSaved } from "@/lib/client/saved";
import { useI18n } from "@/lib/i18n/context";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/listings", key: "nav.findHome" },
  { href: "/status", key: "nav.track" },
  { href: "/help", key: "nav.help" },
];

export function PublicHeader({ active }: { active?: string }) {
  const { user, ready } = useSession();
  const { count } = useSaved();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="nav">
        <div className="wrap nav-inner">
          <BrandMark />
          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={active === l.href ? "active" : undefined}>
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="nav-cta">
            <Link href="/account/saved" className="btn btn-quiet btn-sm" aria-label={`Saved listings${count ? ` (${count})` : ""}`}>
              <Icon name="heart" size={16} />
              {count > 0 && <span>{count}</span>}
            </Link>
            {ready && user ? (
              <LinkButton href="/account/profile" variant="ghost" size="sm">
                <Icon name="users" size={15} /> {user.fullName.split(" ")[0]}
              </LinkButton>
            ) : (
              <LinkButton href="/account/login" variant="ghost" size="sm">
                {t("nav.signIn")}
              </LinkButton>
            )}
            <LinkButton href="/listings" variant="primary" size="sm">
              {t("cta.findHome")}
            </LinkButton>
            <button
              className="btn btn-ghost btn-sm mobile-menu-btn"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className={active === l.href ? "active" : undefined}>
                {t(l.key)}
              </Link>
            ))}
            <Link href="/account/saved" onClick={() => setMenuOpen(false)}>{t("nav.saved")}{count ? ` (${count})` : ""}</Link>
            {ready && user ? (
              <Link href="/account/profile" onClick={() => setMenuOpen(false)}>{t("nav.account")}</Link>
            ) : (
              <Link href="/account/login" onClick={() => setMenuOpen(false)}>{t("nav.signIn")}</Link>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
