import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <span className="mark">R</span>
              <span>Rental Depot</span>
            </div>
            <p className="muted" style={{ fontSize: 14, maxWidth: "34ch", margin: 0 }}>
              A calm, trustworthy way to find a home, apply in minutes, and track your
              application through to a signed lease.
            </p>
          </div>
          <div>
            <h5>Renters</h5>
            <Link href="/listings">Find a home</Link>
            <Link href="/status">Track application</Link>
            <Link href="/account/login">Sign in</Link>
          </div>
          <div>
            <h5>Operators</h5>
            <Link href="/admin/dashboard">Operator dashboard</Link>
            <Link href="/admin/queue">Application queue</Link>
          </div>
          <div>
            <h5>Company</h5>
            <Link href="/">About</Link>
            <Link href="/">Privacy</Link>
            <Link href="/">Contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Rental Depot</span>
          <span className="mono">Records kept, decisions traceable.</span>
        </div>
      </div>
    </footer>
  );
}
