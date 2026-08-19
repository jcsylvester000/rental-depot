import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { UnitCard } from "@/components/applicant/UnitCard";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getStore } from "@/lib/data/store";

export default async function HomePage() {
  const store = await getStore();
  const featured = (await store.listUnits({ sort: "newest" })).slice(0, 3);

  return (
    <>
      <PublicHeader active="/" />

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">Rental applications, kept in good order</span>
          <h1 style={{ marginTop: 16 }}>Find a home, apply in minutes, know exactly where you stand.</h1>
          <p>
            Browse available units, complete one calm application, upload your documents once,
            and track every step through to a signed lease — all in a single, secure record.
          </p>
          <div className="hero-cta">
            <LinkButton href="/listings" variant="primary" size="lg">
              Find a home <Icon name="arrowRight" />
            </LinkButton>
            <LinkButton href="/status" variant="ghost" size="lg">
              Track an application
            </LinkButton>
          </div>
        </div>
      </section>

      {/* FEATURED UNITS */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Now available</span>
              <h2 style={{ marginTop: 8 }}>Recently listed homes</h2>
            </div>
            <LinkButton href="/listings" variant="ghost" size="sm">
              Browse all <Icon name="arrowRight" size={15} />
            </LinkButton>
          </div>
          <div className="grid-3">
            {featured.map((u) => (
              <UnitCard key={u.id} unit={u} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">How it works</span>
              <h2 style={{ marginTop: 8 }}>Three steps to a signed lease</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              { icon: "search", title: "Find your unit", body: "Filter by location, price, and what matters to you. See what's actually available before you invest any effort." },
              { icon: "doc", title: "Apply once", body: "A short, multi-step form that saves as you go. Upload documents from your phone and sign electronically." },
              { icon: "check", title: "Track to approval", body: "Watch your status in plain language, respond to any request in place, and move smoothly into your new home." },
            ].map((f) => (
              <div key={f.title} className="card feature-card">
                <div className="fc-ic">
                  <Icon name={f.icon} size={20} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="section">
        <div className="wrap">
          <div className="panel" style={{ padding: "36px 32px", display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ maxWidth: "44ch" }}>
              <h2 style={{ fontSize: 26 }}>Your information, handled with care.</h2>
              <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
                We ask only what a decision needs, explain why we ask it, and keep every record
                secure with a clear, timestamped trail. Consent is always yours to give.
              </p>
            </div>
            <LinkButton href="/listings" variant="accent" size="lg">
              Get started <Icon name="arrowRight" />
            </LinkButton>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
