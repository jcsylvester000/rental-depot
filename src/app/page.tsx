import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { UnitCard } from "@/components/applicant/UnitCard";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getStore } from "@/lib/data/store";

const HERO_MAIN = "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80";
const HERO_INSET = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";
const RES_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";
const COM_IMG = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

export default async function HomePage() {
  const store = await getStore();
  const all = await store.listUnits({ sort: "newest" });
  const homes = all.filter((u) => u.propertyClass !== "commercial").slice(0, 3);
  const spaces = all.filter((u) => u.propertyClass === "commercial").slice(0, 3);

  return (
    <>
      <PublicHeader active="/" />

      {/* HERO */}
      <section className="hero" id="main">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="hero-tags">
                <span className="hero-tag"><Icon name="home" size={15} /> Homes to rent</span>
                <span className="hero-tag"><Icon name="building" size={15} /> Commercial spaces to lease</span>
              </div>
              <h1>One platform for every lease — homes and commercial spaces alike.</h1>
              <p>
                Whether you&apos;re renting an apartment or leasing a storefront, office, or warehouse,
                Rental Depot turns the whole journey — discovery, application, screening, and signing —
                into one calm, transparent record you can follow end to end.
              </p>
              <div className="hero-cta">
                <LinkButton href="/listings" variant="primary" size="lg">
                  Find a property <Icon name="arrowRight" />
                </LinkButton>
                <LinkButton href="/listings?class=commercial" variant="accent" size="lg">
                  Lease a space <Icon name="arrowRight" />
                </LinkButton>
              </div>
            </div>
            <div className="hero-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-media-main" src={HERO_MAIN} alt="A modern residential building" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-media-inset" src={HERO_INSET} alt="A retail storefront available to lease" />
              <div className="hero-badge">
                <Icon name="check" size={18} />
                <span><b>8 spaces</b> available now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO PATHS */}
      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Built for both sides of the market</span>
              <h2 style={{ marginTop: 8 }}>Residential and commercial, done right</h2>
            </div>
          </div>
          <div className="paths">
            {/* Residential */}
            <div className="path-card">
              <div className="path-media">
                <span className="path-kicker">Residential</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={RES_IMG} alt="A bright apartment living room" />
              </div>
              <div className="path-body">
                <h3>Renting a home</h3>
                <p>A calm, human application built for individuals and families — no jargon, no surprises.</p>
                <ul className="use-list res">
                  {[
                    "Browse by location, price, bedrooms, pets, and amenities",
                    "One multi-step application that saves as you go",
                    "Upload ID, payslips, and proof of income from your phone",
                    "Transparent screening — credit, income, background, eviction — only with your consent",
                    "Invite co-applicants or a guarantor to complete their part privately",
                    "Track your status in plain language and e-sign the lease",
                  ].map((t) => (
                    <li key={t}><span className="ul-ic"><Icon name="check" size={13} /></span>{t}</li>
                  ))}
                </ul>
                <div className="path-foot">
                  <LinkButton href="/listings?class=residential" variant="primary" size="sm">
                    Browse homes <Icon name="arrowRight" size={15} />
                  </LinkButton>
                </div>
              </div>
            </div>

            {/* Commercial */}
            <div className="path-card">
              <div className="path-media">
                <span className="path-kicker">Commercial</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={COM_IMG} alt="A modern office space available to lease" />
              </div>
              <div className="path-body">
                <h3>Leasing a commercial space</h3>
                <p>Retail, office, and warehouse units with a business-ready application built for how companies actually lease.</p>
                <ul className="use-list com">
                  {[
                    "Filter retail, office, and warehouse space by area, rent, and permitted use",
                    "Apply as a business — entity type, nature of business, and years operating",
                    "Match your intended use to each unit's permitted use before you commit",
                    "Upload SEC/DTI registration, financial statements, and business bank records",
                    "Affordability judged on business revenue, with a guarantor or co-signer option",
                    "Longer lease terms with clear deposit and hand-over details",
                  ].map((t) => (
                    <li key={t}><span className="ul-ic"><Icon name="check" size={13} /></span>{t}</li>
                  ))}
                </ul>
                <div className="path-foot">
                  <LinkButton href="/listings?class=commercial" variant="accent" size="sm">
                    Browse commercial spaces <Icon name="arrowRight" size={15} />
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED HOMES */}
      {homes.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Now available</span>
                <h2 style={{ marginTop: 8 }}>Recently listed homes</h2>
              </div>
              <LinkButton href="/listings?class=residential" variant="ghost" size="sm">
                Browse all homes <Icon name="arrowRight" size={15} />
              </LinkButton>
            </div>
            <div className="grid-3">
              {homes.map((u) => (
                <UnitCard key={u.id} unit={u} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED COMMERCIAL */}
      {spaces.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Open for business</span>
                <h2 style={{ marginTop: 8 }}>Commercial spaces to lease</h2>
              </div>
              <LinkButton href="/listings?class=commercial" variant="ghost" size="sm">
                Browse all spaces <Icon name="arrowRight" size={15} />
              </LinkButton>
            </div>
            <div className="grid-3">
              {spaces.map((u) => (
                <UnitCard key={u.id} unit={u} />
              ))}
            </div>
          </div>
        </section>
      )}

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
              { icon: "search", title: "Find your space", body: "Filter homes or commercial units by location, price, and what matters to you. See what's actually available before you invest any effort." },
              { icon: "doc", title: "Apply once", body: "A short, guided form that adapts to renters and businesses alike, saves as you go, and takes your documents straight from your phone." },
              { icon: "check", title: "Track to approval", body: "Watch your status in plain language, respond to any request in place, and e-sign the moment you're approved." },
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

      {/* OPERATOR / TRUST STRIP */}
      <section className="section">
        <div className="wrap">
          <div className="panel" style={{ padding: "36px 32px", display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ maxWidth: "52ch" }}>
              <span className="eyebrow">For operators &amp; landlords</span>
              <h2 style={{ fontSize: 26, marginTop: 8 }}>One dashboard for a mixed portfolio.</h2>
              <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
                Manage residential and commercial listings side by side, screen every applicant on the
                same lawful, decision-relevant criteria, and keep a clear, timestamped audit trail.
                We ask only what a decision needs — and consent is always the applicant&apos;s to give.
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
