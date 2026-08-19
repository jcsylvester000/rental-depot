import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HelpFaq } from "@/components/HelpFaq";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Help & support — Rental Depot" };

const CHANNELS = [
  { icon: "msg", title: "Chat with us", body: "Quick questions, weekdays 9am–6pm.", cta: "Start a chat" },
  { icon: "inbox", title: "Email support", body: "support@rentaldepot.example — we reply within one business day.", cta: "Email us" },
  { icon: "clock", title: "Request a callback", body: "Leave your number and a time that suits you.", cta: "Book a callback" },
];

export default function HelpPage() {
  return (
    <>
      <PublicHeader active="/help" />
      <main id="main" className="wrap" style={{ paddingBottom: 56 }}>
        <div style={{ paddingTop: 40, maxWidth: "60ch" }}>
          <span className="eyebrow">Help & support</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,42px)", marginTop: 10 }}>We're here to help you get home</h1>
          <p className="muted" style={{ marginTop: 12, fontSize: 17 }}>
            Answers to common questions, plus easy ways to reach a person when you need one.
          </p>
        </div>

        {/* channels */}
        <div className="help-channels" style={{ marginTop: 32 }}>
          {CHANNELS.map((c) => (
            <div key={c.title} className="card" style={{ padding: 22 }}>
              <div className="fc-ic" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--verdigris-l)", color: "var(--verdigris)", display: "grid", placeItems: "center", marginBottom: 12 }}>
                <Icon name={c.icon} size={18} />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>{c.title}</h3>
              <p className="muted" style={{ fontSize: 13.5, margin: "0 0 12px" }}>{c.body}</p>
              <button className="btn btn-ghost btn-sm">{c.cta}</button>
            </div>
          ))}
        </div>

        {/* timelines */}
        <div className="panel" style={{ padding: "24px 26px", marginTop: 28, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
          {[
            ["Apply", "~15–20 min"],
            ["Acknowledgement", "Immediate"],
            ["Screening", "24–72 hours"],
            ["Decision", "Within a few days"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="muted" style={{ fontSize: 12, fontFamily: "var(--ff-mono)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
              <div style={{ fontFamily: "var(--ff-display)", fontSize: 20, fontWeight: 600, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* faq */}
        <div style={{ marginTop: 40, maxWidth: 760 }}>
          <h2 style={{ fontSize: 26, marginBottom: 18 }}>Frequently asked</h2>
          <HelpFaq />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
