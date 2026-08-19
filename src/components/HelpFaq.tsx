"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";

const FAQ = [
  { q: "How long does an application take?", a: "About 15–20 minutes if you have your ID and payslips ready. You can save and resume at any time — nothing is lost." },
  { q: "What documents do I need?", a: "A government ID, your two most recent payslips, and proof of income (a bank statement or income letter). You can reuse them across applications from your document locker." },
  { q: "Is there an application fee?", a: "Where it's lawful, a screening fee applies and is shown before you pay. Some areas cap or waive it — the amount is always displayed up front, and you get a receipt." },
  { q: "How long until I hear back?", a: "Screening typically completes within 24–72 hours. You'll see your status update in plain language and get notified by your chosen channels." },
  { q: "How is my information protected?", a: "Sensitive documents and identity details are stored securely and only shared with the property manager for the home you apply to. You control consent, and it's recorded with a timestamp." },
  { q: "Can I apply with a co-applicant or guarantor?", a: "Yes. Invite them by email during the application — each person completes their own part privately and can't see each other's financial details." },
];

export function HelpFaq() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div>
      {FAQ.map((item, i) => (
        <div key={i} className="faq-item">
          <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <Icon name={open === i ? "arrowUp" : "arrowRight"} size={16} />
          </button>
          {open === i && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}
