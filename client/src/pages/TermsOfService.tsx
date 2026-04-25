import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, Calendar, MapPin, Mail, Phone, Shield } from "lucide-react";
import Meta from "@/components/Meta";
import "../styles/LegalPages.css";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  "Acceptance of Terms",
  "Our Services",
  "User Obligations",
  "Intellectual Property",
  "Payment & Billing",
  "Service Availability",
  "Confidentiality",
  "Disclaimer of Warranties",
  "Limitation of Liability",
  "Indemnification",
  "Termination",
  "Governing Law",
  "Changes to Terms",
  "Contact Us",
];

export default function TermsOfService() {
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
      <Meta title="Terms of Service | Bitnox Technology Solutions" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="legal-hero">
        <div className="legal-hero-accent" />

        <div className="legal-hero-badge">
          <FileText />
          Legal Document
        </div>

        <h1 className="legal-hero-title">
          Terms of <span>Service</span>
        </h1>

        <p className="legal-hero-subtitle">
          Please read these terms carefully before using our services. By
          engaging with Bitnox Technology Solutions, you agree to be bound by
          these terms.
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
            Governed by Nigerian Law
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
                <a href={`#tos-${i + 1}`}>
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

        {/* 1. Acceptance */}
        <section id="tos-1" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">01</div>
            <h2 className="legal-section-title">Acceptance of Terms</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            These Terms of Service ("Terms") constitute a legally binding agreement
            between you ("Client", "User", or "you") and <strong>Bitnox Technology
            Solutions</strong> ("Bitnox", "we", "us", or "our"), a technology company
            registered and operating under the laws of the Federal Republic of Nigeria,
            with its principal place of business in Abeokuta, Ogun State, Nigeria.
          </p>
          <p className="legal-text">
            By accessing our website, engaging our services, signing a service
            agreement, or making any payment to Bitnox, you confirm that you have
            read, understood, and agree to be bound by these Terms, together with
            our Privacy Policy and any additional agreements specific to the
            services you engage.
          </p>
          <div className="legal-highlight">
            <p>
              <strong>If you do not agree to these Terms, you must not use or
              access our services.</strong> If you are accepting these Terms on
              behalf of a company or organisation, you represent that you have
              the authority to bind that entity to these Terms.
            </p>
          </div>
        </section>

        {/* 2. Services */}
        <section id="tos-2" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">02</div>
            <h2 className="legal-section-title">Our Services</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Bitnox Technology Solutions provides a range of professional services,
            including but not limited to:
          </p>
          <p className="legal-sub-heading">Technology Services</p>
          <ul className="legal-list">
            <li>Custom web design and development</li>
            <li>Mobile application development (iOS and Android)</li>
            <li>Bespoke software development and system integration</li>
            <li>Cloud infrastructure setup, management, and migration</li>
            <li>Cybersecurity assessments, implementation, and consulting</li>
            <li>IT consulting and technology strategy</li>
            <li>Technical training and capacity building programmes</li>
            <li>Hardware installation, maintenance, and networking</li>
          </ul>
          <p className="legal-sub-heading">Facility & Support Services</p>
          <ul className="legal-list">
            <li>Residential and commercial cleaning services</li>
            <li>Post-construction and deep cleaning</li>
            <li>Laundry and textile care services</li>
            <li>Emergency and specialist cleaning</li>
          </ul>
          <p className="legal-text">
            The scope, timeline, deliverables, and pricing for each engagement
            are defined in a separate Statement of Work (SOW), service proposal,
            or contract agreed upon in writing between both parties. These Terms
            apply universally across all service lines unless otherwise specified
            in a project-specific agreement.
          </p>
        </section>

        {/* 3. User Obligations */}
        <section id="tos-3" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">03</div>
            <h2 className="legal-section-title">User Obligations</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            In order to receive our services, you agree to the following obligations:
          </p>
          <ul className="legal-list">
            <li>
              Provide accurate, current, and complete information as required for
              the delivery of services, including project briefs, access credentials,
              and relevant documentation.
            </li>
            <li>
              Cooperate in good faith with our team throughout the engagement,
              including attending scheduled reviews and providing timely feedback.
            </li>
            <li>
              Not engage in any activity that is unlawful, fraudulent, or harmful,
              including attempting to gain unauthorised access to our systems or
              those of other clients.
            </li>
            <li>
              Not use our services or deliverables to create, distribute, or host
              content that is illegal, defamatory, obscene, or that infringes the
              rights of third parties.
            </li>
            <li>
              Maintain the confidentiality of any account credentials, API keys,
              or access tokens provided to you.
            </li>
            <li>
              Comply with all applicable Nigerian laws and regulations, including
              the Cybercrime (Prohibition, Prevention, Etc.) Act 2015 and the
              Nigeria Data Protection Act 2023.
            </li>
            <li>
              Promptly notify us of any security incidents, suspected breaches,
              or unauthorised use of services we have delivered.
            </li>
          </ul>
        </section>

        {/* 4. IP */}
        <section id="tos-4" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">04</div>
            <h2 className="legal-section-title">Intellectual Property</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-sub-heading">Bitnox Intellectual Property</p>
          <p className="legal-text">
            All proprietary tools, frameworks, methodologies, internal libraries,
            templates, processes, and know-how developed by Bitnox Technology
            Solutions remain the exclusive intellectual property of Bitnox,
            regardless of whether they are used in the delivery of your project.
          </p>
          <p className="legal-sub-heading">Client Deliverables</p>
          <p className="legal-text">
            Upon receipt of full payment for a completed project, Bitnox assigns
            to the Client all rights, title, and interest in the custom source
            code, designs, and written content specifically created for and billed
            to that Client, except where third-party components, open-source
            licences, or pre-existing Bitnox assets are incorporated, which remain
            subject to their respective licences.
          </p>
          <div className="legal-highlight">
            <p>
              Intellectual property rights are transferred <strong>only after
              full and final payment</strong> has been received. Bitnox reserves
              the right to retain work product until all outstanding invoices are
              settled.
            </p>
          </div>
          <p className="legal-sub-heading">Portfolio Rights</p>
          <p className="legal-text">
            Unless you request otherwise in writing, Bitnox reserves the right to
            display publicly accessible aspects of completed work (e.g., screenshots,
            case study summaries) in our portfolio and marketing materials.
          </p>
        </section>

        {/* 5. Payment */}
        <section id="tos-5" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">05</div>
            <h2 className="legal-section-title">Payment & Billing</h2>
          </div>
          <div className="legal-section-divider" />
          <ul className="legal-list">
            <li>
              All fees are quoted and payable in Nigerian Naira (NGN) unless
              an alternative currency is explicitly agreed in writing.
            </li>
            <li>
              Project fees are typically structured as a deposit (50% upfront)
              with the balance due upon completion, unless a milestone-based
              schedule is agreed in the project contract.
            </li>
            <li>
              Invoices are payable within <strong>7 business days</strong> of
              issuance unless otherwise specified.
            </li>
            <li>
              Late payments attract a charge of <strong>2% per month</strong>
              compounded on the outstanding balance, calculated from the due date.
            </li>
            <li>
              Bitnox reserves the right to suspend or withhold services, access,
              and deliverables pending receipt of overdue payments.
            </li>
            <li>
              All fees are exclusive of applicable taxes. Where Value Added Tax
              (VAT) or other statutory levies apply under Nigerian law, these will
              be added to your invoice.
            </li>
            <li>
              Refunds, where applicable, are governed by the specific project
              agreement. Deposits are generally non-refundable once work has
              commenced.
            </li>
          </ul>
        </section>

        {/* 6. Service Availability */}
        <section id="tos-6" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">06</div>
            <h2 className="legal-section-title">Service Availability</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Bitnox strives to deliver services within the timelines and
            specifications agreed in each project contract. However, timelines
            are estimates and may be affected by factors including client
            delays, availability of required materials, scope changes, third-party
            dependencies, or force majeure events.
          </p>
          <p className="legal-text">
            For hosted or managed services (e.g., cloud infrastructure, managed
            applications), we target a service availability of <strong>99.5%
            uptime</strong> in any given calendar month, excluding scheduled
            maintenance windows. Specific service level agreements (SLAs) are
            defined in individual contracts.
          </p>
          <p className="legal-text">
            We reserve the right to perform scheduled maintenance and to take
            services offline temporarily to apply security patches, updates, or
            infrastructure changes. Where reasonably practicable, we will provide
            advance notice of planned downtime.
          </p>
        </section>

        {/* 7. Confidentiality */}
        <section id="tos-7" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">07</div>
            <h2 className="legal-section-title">Confidentiality</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Both parties acknowledge that in the course of an engagement, each
            may receive or have access to confidential information belonging to
            the other party, including but not limited to business strategies,
            technical specifications, source code, financial data, customer lists,
            and proprietary processes ("Confidential Information").
          </p>
          <p className="legal-text">
            Both parties agree to:
          </p>
          <ul className="legal-list">
            <li>
              Hold all Confidential Information in strict confidence and not
              disclose it to any third party without prior written consent.
            </li>
            <li>
              Use Confidential Information solely for the purpose of fulfilling
              obligations under the engagement.
            </li>
            <li>
              Implement reasonable security measures to protect Confidential
              Information from unauthorised access or disclosure.
            </li>
          </ul>
          <p className="legal-text">
            These obligations survive termination of the engagement for a period
            of <strong>3 years</strong>, or indefinitely where the Confidential
            Information constitutes a trade secret.
          </p>
        </section>

        {/* 8. Warranties */}
        <section id="tos-8" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">08</div>
            <h2 className="legal-section-title">Disclaimer of Warranties</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Bitnox Technology Solutions will perform all services with reasonable
            skill and care in accordance with professional industry standards.
            However, to the maximum extent permitted by applicable Nigerian law:
          </p>
          <ul className="legal-list">
            <li>
              Our services and deliverables are provided "as is" without any
              express or implied warranty of fitness for a particular purpose
              beyond what is explicitly documented in the project agreement.
            </li>
            <li>
              We do not warrant that software deliverables will be free of all
              bugs or errors, but we commit to addressing reported defects
              within the warranty period specified in each project contract.
            </li>
            <li>
              We make no warranty regarding the continued operation of
              third-party platforms, APIs, or services that our deliverables
              may depend upon.
            </li>
          </ul>
        </section>

        {/* 9. Limitation of Liability */}
        <section id="tos-9" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">09</div>
            <h2 className="legal-section-title">Limitation of Liability</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            To the maximum extent permitted under applicable Nigerian law, Bitnox
            Technology Solutions shall not be liable for:
          </p>
          <ul className="legal-list">
            <li>
              Any indirect, incidental, special, consequential, or punitive damages
              arising out of or related to these Terms or the services.
            </li>
            <li>
              Loss of profits, revenue, data, business opportunities, or goodwill,
              even if we have been advised of the possibility of such losses.
            </li>
            <li>
              Damages arising from your reliance on information provided in our
              consultancy or training services, where such information was accurate
              at the time of delivery.
            </li>
            <li>
              Any failure or delay caused by circumstances beyond our reasonable
              control, including power outages, internet service disruptions,
              natural disasters, or actions of government authorities.
            </li>
          </ul>
          <div className="legal-highlight">
            <p>
              In any event, our total aggregate liability to you for any claim
              arising out of or related to an engagement shall not exceed the
              <strong> total fees paid by you to Bitnox for the specific project
              giving rise to the claim</strong> in the twelve (12) months
              preceding the claim.
            </p>
          </div>
          <p className="legal-text">
            Nothing in these Terms limits our liability for death or personal
            injury caused by our negligence, or for fraud or fraudulent
            misrepresentation, or for any other liability that cannot be excluded
            under applicable law.
          </p>
        </section>

        {/* 10. Indemnification */}
        <section id="tos-10" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">10</div>
            <h2 className="legal-section-title">Indemnification</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            You agree to defend, indemnify, and hold harmless Bitnox Technology
            Solutions, its directors, employees, contractors, and agents from and
            against any claims, liabilities, damages, losses, costs, and expenses
            (including reasonable legal fees) arising out of or in connection with:
          </p>
          <ul className="legal-list">
            <li>Your violation of these Terms or any applicable law.</li>
            <li>
              Your use or misuse of deliverables or services in a manner not
              authorised or contemplated by these Terms or the project agreement.
            </li>
            <li>
              Any third-party claims arising from content, data, or instructions
              you provided to Bitnox in the course of an engagement.
            </li>
            <li>
              Any infringement of third-party intellectual property rights caused
              by materials, content, or specifications supplied by you.
            </li>
          </ul>
        </section>

        {/* 11. Termination */}
        <section id="tos-11" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">11</div>
            <h2 className="legal-section-title">Termination</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-sub-heading">Termination by Client</p>
          <p className="legal-text">
            You may terminate a project engagement by providing written notice.
            In such cases, you remain liable for all fees for work completed up
            to the date of termination. Deposits and milestone payments already
            made are non-refundable unless otherwise agreed in writing.
          </p>
          <p className="legal-sub-heading">Termination by Bitnox</p>
          <p className="legal-text">
            Bitnox may terminate or suspend an engagement with immediate effect
            upon written notice if:
          </p>
          <ul className="legal-list">
            <li>You materially breach these Terms and fail to remedy the breach within 14 days of notice.</li>
            <li>You become insolvent, enter administration, or are subject to winding-up proceedings.</li>
            <li>You engage in unlawful activity or use our services for illegal purposes.</li>
            <li>Payment obligations remain outstanding beyond 30 days of the due date.</li>
          </ul>
          <p className="legal-text">
            Upon termination, clauses relating to intellectual property ownership,
            confidentiality, limitation of liability, indemnification, and
            governing law shall survive.
          </p>
        </section>

        {/* 12. Governing Law */}
        <section id="tos-12" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">12</div>
            <h2 className="legal-section-title">Governing Law & Dispute Resolution</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            These Terms and all engagements between you and Bitnox Technology Solutions
            are governed by and construed in accordance with the laws of the
            <strong> Federal Republic of Nigeria</strong>, including but not limited to the
            Federal Competition and Consumer Protection Act (FCCPA) 2019 and the
            Consumer Protection Council Act (Cap C25, LFN 2004).
          </p>
          <p className="legal-text">
            In the event of any dispute arising out of or in connection with these
            Terms or any engagement, the parties agree to first attempt resolution
            through good-faith negotiation within <strong>30 days</strong> of written
            notice of the dispute.
          </p>
          <p className="legal-text">
            If negotiation fails, the parties agree to submit the dispute to
            mediation administered by the Lagos Court of Arbitration or any
            mutually agreed arbitration body under Nigerian law. If mediation
            is unsuccessful, either party may refer the matter to the courts of
            competent jurisdiction in <strong>Ogun State, Nigeria</strong>.
          </p>
        </section>

        {/* 13. Changes */}
        <section id="tos-13" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">13</div>
            <h2 className="legal-section-title">Changes to These Terms</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            Bitnox Technology Solutions reserves the right to update or modify
            these Terms at any time. Where changes are material, we will provide
            notice via email to registered clients or by posting a prominent
            notice on our website at least <strong>14 days</strong> before the
            changes take effect.
          </p>
          <p className="legal-text">
            Your continued use of our services or your execution of a new service
            agreement after changes are published constitutes your acceptance of
            the updated Terms. If you do not agree to the revised Terms, you must
            stop using our services and notify us in writing.
          </p>
          <p className="legal-text">
            We recommend you review these Terms periodically. The "Last Updated"
            date at the top of this page indicates when changes were last made.
          </p>
        </section>

        {/* 14. Contact */}
        <section id="tos-14" className="legal-section">
          <div className="legal-section-header">
            <div className="legal-section-number">14</div>
            <h2 className="legal-section-title">Contact Us</h2>
          </div>
          <div className="legal-section-divider" />
          <p className="legal-text">
            If you have any questions, concerns, or requests relating to these
            Terms of Service, please contact us through any of the channels below:
          </p>
          <div className="legal-contact-card">
            <div className="legal-contact-item">
              <div className="legal-contact-item-icon">
                <Shield size={18} />
              </div>
              <div className="legal-contact-item-label">Company</div>
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
                <MapPin size={18} />
              </div>
              <div className="legal-contact-item-label">Office Hours</div>
              <div className="legal-contact-item-value">
                Monday – Friday<br />
                8:00 AM – 6:00 PM WAT
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <div className="legal-cta">
        <div className="legal-cta-inner">
          <h3 className="legal-cta-title">Have Questions About Our Terms?</h3>
          <p className="legal-cta-text">
            Our team is happy to clarify any aspect of these Terms before you
            engage our services. Reach out and we'll respond within one business day.
          </p>
          <a href="/contact" className="legal-cta-btn">
            <Mail size={16} />
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
