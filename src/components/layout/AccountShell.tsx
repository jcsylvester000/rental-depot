"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/client/session";

const NAV = [
  { href: "/account/profile", label: "Profile", icon: "users" },
  { href: "/account/saved", label: "Saved homes", icon: "heart" },
  { href: "/account/documents", label: "Documents", icon: "doc" },
  { href: "/status", label: "My applications", icon: "inbox" },
];

export function AccountShell({ active, children }: { active: string; children: React.ReactNode }) {
  const { user, ready, logout } = useSession();
  const router = useRouter();

  return (
    <>
      <PublicHeader />
      <div className="wrap">
        <div className="account-layout">
          <aside className="account-nav" aria-label="Account">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={active === n.href ? "active" : undefined}>
                <Icon name={n.icon} size={16} /> {n.label}
              </Link>
            ))}
            {ready && user && (
              <button
                className="account-nav-signout"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "var(--grey)", background: "none", border: "none", textAlign: "left", cursor: "pointer", marginTop: 6 }}
              >
                <Icon name="logout" size={16} /> Sign out
              </button>
            )}
          </aside>
          <div id="main">{children}</div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}
