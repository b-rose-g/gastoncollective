import { Link, useLocation } from "react-router-dom";
import { GASTON_CONTACT_EMAIL, GASTON_CONTACT_MAILTO } from "@/lib/contact";
import { routeMetadata, usePageMetadata } from "@/lib/seo";

const updated = "June 3, 2026";

export default function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const location = useLocation();
  const isPrivacy = type === "privacy";

  usePageMetadata(isPrivacy ? routeMetadata.privacy : routeMetadata.terms);

  return (
    <main style={{ backgroundColor: "#FAF8F4", minHeight: "100vh", color: "#3B2317" }}>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <Link
          to="/"
          className="font-sans text-xs uppercase tracking-[0.15em]"
          style={{ color: "#A67B5B", textDecoration: "none" }}
        >
          Back to The Gaston Collective
        </Link>
        <h1 className="font-serif mt-8" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600 }}>
          {isPrivacy ? "Privacy Policy" : "Terms"}
        </h1>
        <p className="font-sans mt-3" style={{ color: "#5A4D42" }}>
          Last updated {updated}
        </p>

        {isPrivacy ? <PrivacyContent /> : <TermsContent />}

        <p className="font-sans mt-10 text-sm" style={{ color: "#5A4D42" }}>
          Questions about {location.pathname === "/privacy" ? "privacy" : "these terms"} can be sent to{" "}
          <a href={GASTON_CONTACT_MAILTO} style={{ color: "#A67B5B" }}>
            {GASTON_CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </main>
  );
}

function PrivacyContent() {
  return (
    <div className="font-sans mt-10 space-y-7" style={{ color: "#5A4D42", lineHeight: 1.8 }}>
      <section>
        <h2 className="font-serif text-2xl mb-3" style={{ color: "#3B2317" }}>Information Collected</h2>
        <p>
          Inquiry, booking, commission, and contact forms collect the details you submit, including name, email,
          phone number, project notes, preferred appointment times, and uploaded reference images.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl mb-3" style={{ color: "#3B2317" }}>How It Is Used</h2>
        <p>
          Information is used to respond to messages, quote work, schedule appointments, prepare designs, fulfill
          shop inquiries, and maintain records needed for service and safety.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl mb-3" style={{ color: "#3B2317" }}>Storage and Access</h2>
        <p>
          Form submissions and reference images are stored on the site server and are available only through the
          protected owner dashboard. Records can be deleted or corrected by request.
        </p>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="font-sans mt-10 space-y-7" style={{ color: "#5A4D42", lineHeight: 1.8 }}>
      <section>
        <h2 className="font-serif text-2xl mb-3" style={{ color: "#3B2317" }}>Website Use</h2>
        <p>
          Content on this site belongs to The Gaston Collective unless otherwise credited. Do not reuse artwork,
          photographs, written content, or shop designs without written permission.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl mb-3" style={{ color: "#3B2317" }}>Bookings and Commissions</h2>
        <p>
          Form submissions are requests, not confirmed appointments or orders. Quotes, deposits, timelines, and
          final approvals are confirmed directly by email or message before work begins.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl mb-3" style={{ color: "#3B2317" }}>Shop Inquiries</h2>
        <p>
          Shop items are handled by inquiry or preorder unless a separate checkout is provided. Shipping,
          pickup, payment, and returns are confirmed before purchase.
        </p>
      </section>
    </div>
  );
}
