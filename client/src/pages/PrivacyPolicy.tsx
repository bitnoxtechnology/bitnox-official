import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Calendar, MapPin, Mail, Phone, Lock } from "lucide-react";
import Meta from "@/components/Meta";
import "../styles/LegalPages.css";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  "Introduction",
  "Information We Collect",
  "How We Use Your Information",
  "Legal Basis for Processing",
  "Sharing Your Information",
  "Data Retention",
  "Your Rights Under NDPA",
  "Cookies & Tracking",
  "Security Measures",
  "Children's Privacy",
  "International Transfers",
  "Third-Party Links",
  "Changes to This Policy",
  "Contact & DPO",
];

export default function PrivacyPolicy() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      gsap.from(".legal-hero-badge", {
        opacity: 0,
        y: -20,
        duration: 0.6,
      });
      gsap.from(".legal-hero-title", {
        opacity: 0,
        y: 30,
        duration: 0.7,
        delay: 0.15,
      });
      gsap.from(".legal-hero-subtitle", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.3,
      });
      gsap.from(".legal-hero-meta", {
        opacity: 0,
        y: 15,
        duration: 0.5,
        delay: 0.45,
      });

      gsap.utils.toArray<Element>(".legal-section").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.65,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      gsap.from(".legal-cta-inner", {
        opacity: 0,
        y: 24,
        duration: 0.65,
        scrollTrigger: {
          trigger: ".legal-cta",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="legal-page">
      <Meta title="Privacy Policy | Bitnox Technology Solutions" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="legal-hero">
        <div className="legal-hero-accent" />

        <div className="legal-hero-badge">
          <ShieldCheck />
          NDPA Compliant
        </div>

        <h1 className="legal-hero-title">
          Privacy <span>Policy</span>
        </h1>

        <p className="legal-hero-subtitle">
          We are committed to protecting your personal data in accordance with the
          Nigeria Data Protection Act 2023 (NDPA) and all applicable regulations.
        </p>

        <div className="legal-hero-meta">
          <span className="legal-hero-meta-item">
            <Calendar size={14} />
            Effective: 1st January 2025
          </span>
          <span className="legal-hero-meta-item">
            <Calendar size={14} />
            Last updated: 25th April 2026
          </span>
          <span className="legal-hero-meta-item">
            <MapPin size={14} />
            Nigerian Law Applies
          </span>
        </div>
      </section>

      {/* ── Table of Contents ─────────────────────────────────────── */}
      <div className="legal-toc-wrapper">
        <nav className="legal-toc">
          <p className="legal-toc-title">Table of Contents</p>
          <ol className="legal-toc-grid">
            {SECTIONS.map((title, i) => (
              <li key={i}>
                <a href={`#pp-${i + 1}`}>
                  <span className="toc-number">{String(i + 1).padStart(2, "0")}</span>
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="legal-body">

        {/* 1. Introduction */}
        <section id="pp-1" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">01</div>
            <h2 className="legal-section-title">Introduction</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            <strong>Bitnox Technology Solutions</strong> ("Bitnox", "we", "us", or "our")
            is a technology company headquartered in Abeokuta, Ogun State, Nigeria.
            We provide technology and facility management services to individuals,
            businesses, and organisations across Nigeria and beyond.
          </p>
          <p className="legal-text">
            This Privacy Policy explains how we collect, use, store, protect,
            and share personal data when you visit our website, inquire about our
            services, engage us as a client, or otherwise interact with us. It
            applies to all data subjects whose personal information we process.
          </p>
          <div className="legal-highlight">
            <p>
              This Policy is made pursuant to the <strong>Nigeria Data Protection
              Act 2023 (NDPA)</strong>, the <strong>Nigeria Data Protection Regulation
              2019 (NDPR)</strong>, and the guidelines issued by the Nigeria Data
              Protection Commission (NDPC). By using our services or providing
              us with your information, you acknowledge this Policy.
            </p>
          </div>
          <p className="legal-text">
            Bitnox acts as a <strong>Data Controller</strong> for personal data
            collected directly from you. Where we process data on behalf of our
            clients, we act as a <strong>Data Processor</strong>, governed by
            our data processing agreements with those clients.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section id="pp-2" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">02</div>
            <h2 className="legal-section-title">Information We Collect</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-sub-heading">Information You Provide Directly</p>
          <ul className="legal-list">
            <li>Full name, email address, phone number, and company/organisation name when you contact us or request a quote.</li>
            <li>Billing details, bank account information, or payment card data when you engage our paid services.</li>
            <li>Login credentials (username and hashed password) when you create an account on our platform.</li>
            <li>Project briefs, specifications, files, images, and other content you provide during a service engagement.</li>
            <li>Feedback, survey responses, and testimonials you voluntarily share.</li>
          </ul>
          <p className="legal-sub-heading">Information Collected Automatically</p>
          <ul className="legal-list">
            <li>IP address, browser type and version, operating system, and device identifiers.</li>
            <li>Pages visited, time spent, referral URLs, and click-through data via cookies and similar technologies.</li>
            <li>Device fingerprint data used for session authentication and security purposes.</li>
            <li>Log files generated by interactions with our web applications and APIs.</li>
          </ul>
          <p className="legal-sub-heading">Information from Third Parties</p>
          <ul className="legal-list">
            <li>Business contact details from publicly available professional directories or referrals.</li>
            <li>Analytics data from platforms such as Google Analytics (subject to their own privacy policies).</li>
            <li>Social media profile information where you interact with our official pages.</li>
          </ul>
        </section>

        {/* 3. How We Use */}
        <section id="pp-3" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">03</div>
            <h2 className="legal-section-title">How We Use Your Information</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            We use the personal data we collect for the following purposes:
          </p>
          <ul className="legal-list">
            <li>
              <strong>Service Delivery:</strong> To perform contracted work, manage
              projects, communicate progress, and deliver completed deliverables.
            </li>
            <li>
              <strong>Account Management:</strong> To create and maintain user accounts,
              authenticate users, and manage session security.
            </li>
            <li>
              <strong>Billing & Finance:</strong> To issue invoices, process payments,
              and maintain accurate financial records as required by Nigerian law.
            </li>
            <li>
              <strong>Customer Support:</strong> To respond to enquiries, resolve
              disputes, and provide technical support.
            </li>
            <li>
              <strong>Marketing & Communications:</strong> To send newsletters, service
              updates, and promotional materials where you have consented or where
              we have a legitimate interest (with an easy opt-out).
            </li>
            <li>
              <strong>Security & Fraud Prevention:</strong> To monitor for suspicious
              activity, prevent unauthorised access, and protect our systems and clients.
            </li>
            <li>
              <strong>Legal Compliance:</strong> To meet our obligations under Nigerian
              law, respond to lawful government or regulatory requests, and enforce
              our Terms of Service.
            </li>
            <li>
              <strong>Analytics & Improvement:</strong> To understand how our website
              and services are used and to improve the user experience.
            </li>
          </ul>
        </section>

        {/* 4. Legal Basis */}
        <section id="pp-4" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">04</div>
            <h2 className="legal-section-title">Legal Basis for Processing</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Under the Nigeria Data Protection Act 2023, we rely on the following
            lawful bases for processing your personal data:
          </p>
          <ul className="legal-list legal-list--alpha">
            <li>
              <strong>Contract Performance:</strong> Processing necessary to fulfil
              a contract you have entered into with us, or to take steps at your
              request before entering into a contract.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Where processing is necessary
              for our legitimate business interests (e.g., improving services,
              fraud prevention), provided these interests are not overridden by
              your rights.
            </li>
            <li>
              <strong>Consent:</strong> Where you have freely, specifically, and
              unambiguously given consent, including for marketing communications
              and the use of non-essential cookies.
            </li>
            <li>
              <strong>Legal Obligation:</strong> Where processing is required to
              comply with a legal or regulatory obligation applicable to Bitnox
              under Nigerian law.
            </li>
            <li>
              <strong>Vital Interests:</strong> In rare circumstances where processing
              is necessary to protect the vital interests of a data subject or
              another person.
            </li>
          </ul>
        </section>

        {/* 5. Sharing */}
        <section id="pp-5" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">05</div>
            <h2 className="legal-section-title">Sharing Your Information</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            We do not sell, rent, or trade your personal data. We may share your
            information in the following limited circumstances:
          </p>
          <ul className="legal-list">
            <li>
              <strong>Service Providers:</strong> Trusted third-party vendors who
              assist in delivering our services (e.g., cloud hosting providers,
              payment processors, email platforms). These parties are contractually
              bound to process data only on our instructions and in accordance with
              applicable law.
            </li>
            <li>
              <strong>Subcontractors:</strong> Vetted freelancers or partner agencies
              engaged to contribute to your project, subject to confidentiality and
              data protection obligations.
            </li>
            <li>
              <strong>Legal Requirements:</strong> Where we are required to disclose
              information by law, court order, or at the direction of a competent
              regulatory authority in Nigeria, including the NDPC.
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger,
              acquisition, or sale of assets, personal data may be transferred
              as part of the business. We will notify affected data subjects
              as required by law.
            </li>
            <li>
              <strong>With Your Consent:</strong> For any other purpose with
              your explicit prior consent.
            </li>
          </ul>
        </section>

        {/* 6. Retention */}
        <section id="pp-6" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">06</div>
            <h2 className="legal-section-title">Data Retention</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            We retain personal data only for as long as necessary for the purposes
            for which it was collected, or as required by law:
          </p>
          <ul className="legal-list">
            <li>
              <strong>Client project records</strong> (contracts, deliverables,
              correspondence): retained for a minimum of <strong>7 years</strong>
              after project completion, in compliance with Nigerian tax and
              commercial law requirements.
            </li>
            <li>
              <strong>Financial and billing records:</strong> retained for
              <strong> 7 years</strong> as required by the Federal Inland Revenue
              Service Act and the Companies and Allied Matters Act (CAMA).
            </li>
            <li>
              <strong>Marketing data (newsletter subscribers):</strong> retained
              until you withdraw your consent or unsubscribe.
            </li>
            <li>
              <strong>Website analytics data:</strong> aggregated and anonymised
              after <strong>26 months</strong>.
            </li>
            <li>
              <strong>Inactive user accounts:</strong> deactivated after
              <strong> 24 months</strong> of inactivity, with prior notice.
            </li>
          </ul>
          <p className="legal-text">
            When data is no longer required, we securely delete or anonymise it
            using industry-standard data destruction practices.
          </p>
        </section>

        {/* 7. Your Rights */}
        <section id="pp-7" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">07</div>
            <h2 className="legal-section-title">Your Rights Under the NDPA</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Under the Nigeria Data Protection Act 2023, you have the following
            rights with respect to your personal data:
          </p>
          <ul className="legal-list">
            <li>
              <strong>Right of Access:</strong> Request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Right to Rectification:</strong> Request correction of
              inaccurate or incomplete personal data.
            </li>
            <li>
              <strong>Right to Erasure ("Right to be Forgotten"):</strong> Request
              deletion of your personal data, subject to our legal retention
              obligations.
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> Request that we limit
              how we use your data in certain circumstances.
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Receive your personal
              data in a structured, machine-readable format.
            </li>
            <li>
              <strong>Right to Object:</strong> Object to processing based on
              legitimate interests, including direct marketing.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Where processing is
              based on consent, withdraw it at any time without affecting the
              lawfulness of prior processing.
            </li>
            <li>
              <strong>Right to Lodge a Complaint:</strong> File a complaint with
              the Nigeria Data Protection Commission (NDPC) at{" "}
              <strong>ndpc.gov.ng</strong> if you believe your rights have been
              violated.
            </li>
          </ul>
          <p className="legal-text">
            To exercise any of these rights, please submit a written request to
            our Data Protection Officer at the contact details in Section 14.
            We will respond within <strong>30 days</strong> in accordance with
            the NDPA.
          </p>
        </section>

        {/* 8. Cookies */}
        <section id="pp-8" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">08</div>
            <h2 className="legal-section-title">Cookies & Tracking Technologies</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Our website uses cookies and similar technologies (e.g., local storage,
            session storage) to operate correctly, enhance your experience, and
            gather analytics.
          </p>
          <p className="legal-sub-heading">Types of Cookies We Use</p>
          <ul className="legal-list">
            <li>
              <strong>Strictly Necessary Cookies:</strong> Essential for site
              functionality, such as authentication sessions, security tokens,
              and device fingerprinting for login security. These cannot be
              disabled without breaking core features.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Used to understand site usage
              patterns (e.g., Google Analytics). Data is aggregated and
              anonymised where possible. These require your consent.
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings such
              as dark mode preferences, stored in localStorage.
            </li>
          </ul>
          <p className="legal-text">
            You may manage or delete cookies through your browser settings at
            any time. Note that disabling cookies may affect the functionality
            of our website. By continuing to use our site, you consent to
            non-essential cookies where our cookie banner has been acknowledged.
          </p>
        </section>

        {/* 9. Security */}
        <section id="pp-9" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">09</div>
            <h2 className="legal-section-title">Security Measures</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            We implement appropriate technical and organisational measures to
            protect personal data against unauthorised access, loss, destruction,
            alteration, or disclosure. These measures include:
          </p>
          <ul className="legal-list">
            <li>Encryption of data in transit using TLS/SSL protocols.</li>
            <li>Password hashing using industry-standard algorithms (bcrypt/Argon2).</li>
            <li>OTP-based and device-fingerprint authentication for platform access.</li>
            <li>Role-based access controls limiting data access to authorised personnel.</li>
            <li>Regular security assessments and vulnerability scanning.</li>
            <li>Secure cloud infrastructure with reputable providers (e.g., AWS).</li>
          </ul>
          <div className="legal-highlight">
            <p>
              Despite our best efforts, no internet-based system is completely secure.
              <strong> In the event of a personal data breach</strong>, we will notify
              affected data subjects and the NDPC within <strong>72 hours</strong> of
              becoming aware, as required by the NDPA.
            </p>
          </div>
        </section>

        {/* 10. Children */}
        <section id="pp-10" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">10</div>
            <h2 className="legal-section-title">Children's Privacy</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Our services are intended for individuals aged <strong>18 years and older</strong>.
            We do not knowingly collect personal data from children under the age of 18.
            If you are a parent or guardian and believe your child has provided us with
            personal data without your consent, please contact us immediately at
            {" "}<a href="mailto:info@bitnoxsolution.com" style={{ color: "#05e4fc" }}>
              info@bitnoxsolution.com
            </a> and we will take prompt steps to delete such data.
          </p>
          <p className="legal-text">
            Where any of our training or educational services may be accessed by
            minors under parental supervision, appropriate parental or guardian
            consent must be obtained before registration.
          </p>
        </section>

        {/* 11. International Transfers */}
        <section id="pp-11" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">11</div>
            <h2 className="legal-section-title">International Data Transfers</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            As part of our operations, personal data may be transferred to or stored
            in countries outside Nigeria, particularly where we use international
            cloud infrastructure or third-party service providers based abroad.
          </p>
          <p className="legal-text">
            Where such transfers occur, we ensure that:
          </p>
          <ul className="legal-list">
            <li>
              The recipient country provides an adequate level of data protection
              as recognised under Nigerian law.
            </li>
            <li>
              Appropriate safeguards are in place, such as data processing agreements
              incorporating standard contractual clauses.
            </li>
            <li>
              Transfers are made only to service providers that are contractually
              obligated to protect personal data in compliance with NDPA standards.
            </li>
          </ul>
        </section>

        {/* 12. Third-Party Links */}
        <section id="pp-12" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">12</div>
            <h2 className="legal-section-title">Third-Party Links & Services</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Our website and deliverables may contain links to third-party websites,
            platforms, or services (e.g., social media, payment gateways, educational
            platforms such as{" "}
            <a href="https://edu.bitnoxsolution.com" style={{ color: "#05e4fc" }}>
              edu.bitnoxsolution.com
            </a>). These third-party services operate under their own privacy
            policies, and we are not responsible for their data practices.
          </p>
          <p className="legal-text">
            We encourage you to review the privacy policies of any third-party
            services you access through links on our platforms. The inclusion of
            a link does not imply our endorsement of the third party's privacy
            practices.
          </p>
        </section>

        {/* 13. Changes */}
        <section id="pp-13" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">13</div>
            <h2 className="legal-section-title">Changes to This Policy</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            We may update this Privacy Policy from time to time to reflect changes
            in our data practices, legal requirements, or operational changes. The
            "Last Updated" date at the top of this page will be revised accordingly.
          </p>
          <p className="legal-text">
            Where changes are material, we will notify registered users via email
            at least <strong>14 days</strong> before the changes take effect.
            Your continued use of our services after the effective date constitutes
            your acceptance of the updated Policy.
          </p>
          <p className="legal-text">
            We recommend you review this Policy periodically. Previous versions
            are available on request.
          </p>
        </section>

        {/* 14. Contact / DPO */}
        <section id="pp-14" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">14</div>
            <h2 className="legal-section-title">Contact & Data Protection Officer</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            For any questions, concerns, data access requests, or complaints
            regarding this Privacy Policy or how we handle your personal data,
            please contact our Data Protection Officer (DPO):
          </p>
          <div className="legal-contact-card">
            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <Lock size={18} />
              </div>
              <div className="legal-contact-item-label">DPO / Controller</div>
              <div className="legal-contact-item-value">
                Bitnox Technology Solutions<br />
                Abeokuta, Ogun State, Nigeria
              </div>
            </div>
            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <Mail size={18} />
              </div>
              <div className="legal-contact-item-label">Email</div>
              <div className="legal-contact-item-value">
                <a href="mailto:info@bitnoxsolution.com">
                  info@bitnoxsolution.com
                </a>
              </div>
            </div>
            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <Phone size={18} />
              </div>
              <div className="legal-contact-item-label">Phone</div>
              <div className="legal-contact-item-value">
                <a href="tel:+2348137192766">+234 813 719 2766</a>
              </div>
            </div>
            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="legal-contact-item-label">Regulatory Body</div>
              <div className="legal-contact-item-value">
                Nigeria Data Protection Commission (NDPC)<br />
                ndpc.gov.ng
              </div>
            </div>
          </div>
          <div className="legal-highlight" style={{ marginTop: "20px" }}>
            <p>
              We aim to respond to all data subject requests and complaints within
              <strong> 30 days</strong> of receipt, as required by the Nigeria Data
              Protection Act 2023. If you are unsatisfied with our response, you have
              the right to escalate your complaint to the NDPC.
            </p>
          </div>
        </section>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <div className="legal-cta">
        <div className="legal-cta-inner">
          <h3 className="legal-cta-title">Questions About Your Data?</h3>
          <p className="legal-cta-text">
            Your privacy matters to us. If you have any concerns about how we
            handle your personal information, our team is ready to help.
          </p>
          <a href="/contact" className="legal-cta-btn">
            <Mail size={16} />
            Contact Our DPO
          </a>
        </div>
      </div>
    </div>
  );
}
