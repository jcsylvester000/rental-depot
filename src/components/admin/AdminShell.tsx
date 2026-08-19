"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const WORKSPACE = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/admin/queue", label: "Applications", icon: "inbox", badge: true },
  { href: "/admin/compare", label: "Compare", icon: "scale" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" },
];

export function AdminShell({ title, crumb = "Workspace", children }: { title: string; crumb?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/admin/queue")
      .then((r) => r.json())
      .then((j) => j.ok && setCount(j.data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link className="brand" href="/admin/dashboard">
          <span className="mark">R</span>
          <span>Rental Depot<small>Operator</small></span>
        </Link>
        <div className="nav-section">
          <div className="ns-title">Workspace</div>
          {WORKSPACE.map((l) => {
            const active = pathname === l.href || (l.href === "/admin/queue" && pathname.startsWith("/admin/applicant"));
            return (
              <Link key={l.href} href={l.href} className={`side-link ${active ? "active" : ""}`}>
                <Icon name={l.icon} size={17} /> {l.label}
                {l.badge && count != null && <span className="badge">{count}</span>}
              </Link>
            );
          })}
        </div>
        <div className="side-foot">
          <div className="side-user">
            <div className="av">PM</div>
            <div><div>Property Manager</div><small>Rental Depot Estates</small></div>
          </div>
          <Link className="side-link" href="/" style={{ marginTop: 10 }}><Icon name="logout" size={16} /> Back to site</Link>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-top">
          <div>
            <div className="crumb">{crumb}</div>
            <h1>{title}</h1>
          </div>
          <div className="top-actions">
            <div className="top-search"><Icon name="search" size={16} /><input placeholder="Search applicants, units, IDs…" /></div>
            <button className="icon-btn" aria-label="Notifications"><Icon name="bell" size={18} /><span className="dot" /></button>
          </div>
        </div>
        <div className="admin-content" id="main">{children}</div>
      </div>
    </div>
  );
}
