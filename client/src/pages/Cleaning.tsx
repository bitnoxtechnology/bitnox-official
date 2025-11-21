"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle,
  Award,
  Users,
  Shield,
  Sparkles,
  Clock,
} from "lucide-react";
import "../styles/CleaningPage.css";
import CleaningImage from "../assets/CleaningImage.jpg";
import Meta from "../components/Meta";

gsap.registerPlugin(ScrollTrigger);

export default function Cleaning() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".cleaning-hero-label", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".cleaning-hero-title", {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".cleaning-hero-description", {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });

      gsap.from(".cleaning-hero-cta", {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
      });

      // Stats animations
      gsap.utils.toArray(".cleaning-stat-card").forEach((card, index) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power3.out",
        });
      });

      // Service cards animations
      gsap.utils.toArray(".cleaning-service-card").forEach((card, index) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 40,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power3.out",
        });
      });

      // Feature cards animations
      gsap.utils.toArray(".cleaning-feature-card").forEach((card, index) => {
        gsap.from(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          x: index % 2 === 0 ? -40 : 40,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power3.out",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Meta title="Cleaning | Bitnox Technology" />

      <div ref={containerRef} className="cleaning-page">
        {/* Hero Section */}
        <section className="cleaning-hero-section">
          <div className="cleaning-hero-pattern"></div>
          <div className="cleaning-hero-content">
            <div className="cleaning-hero-label">
              Professional Cleaning Solutions
            </div>
            <h1 className="cleaning-hero-title">
              Reclaim Your Time with Bitnox Cleaning
            </h1>
            <p className="cleaning-hero-description">
              Experience the ultimate cleaning transformation. Our expertly
              trained team delivers exceptional home cleaning, laundry services,
              post-construction cleanup, and office maintenance. With thousands
              of 5-star reviews and satisfied customers, trust Bitnox to handle
              all your cleaning needs while you focus on what truly matters.
            </p>
            <button className="cleaning-hero-cta">
              Book Your Cleaning Today
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="cleaning-stats-section">
          <div className="cleaning-container">
            <div className="cleaning-stats-grid">
              <div className="cleaning-stat-card">
                <div className="cleaning-stat-number">47+</div>
                <div className="cleaning-stat-label">Team Members</div>
              </div>
              <div className="cleaning-stat-card">
                <div className="cleaning-stat-number">07</div>
                <div className="cleaning-stat-label">Award Winning</div>
              </div>
              <div className="cleaning-stat-card">
                <div className="cleaning-stat-number">543+</div>
                <div className="cleaning-stat-label">Happy Customers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="cleaning-services-section">
          <div className="cleaning-container">
            <h2 className="cleaning-section-title">Our Cleaning Services</h2>
            <div className="cleaning-services-grid">
              <div className="cleaning-service-card">
                <div className="cleaning-service-icon">
                  <Sparkles size={32} />
                </div>
                <h3>Home Cleaning</h3>
                <p>
                  Professional deep cleaning for your home with attention to
                  every detail. We use eco-friendly products and proven
                  techniques.
                </p>
              </div>
              <div className="cleaning-service-card">
                <div className="cleaning-service-icon">
                  <Shield size={32} />
                </div>
                <h3>Office Cleaning</h3>
                <p>
                  Keep your workspace pristine and professional. Our office
                  cleaning ensures a healthy and productive environment for your
                  team.
                </p>
              </div>
              <div className="cleaning-service-card">
                <div className="cleaning-service-icon">
                  <CheckCircle size={32} />
                </div>
                <h3>Post-Construction Cleanup</h3>
                <p>
                  After renovation or construction, we handle complete cleanup
                  including debris removal, dusting, and final polishing.
                </p>
              </div>
              <div className="cleaning-service-card">
                <div className="cleaning-service-icon">
                  <Award size={32} />
                </div>
                <h3>Laundry Services</h3>
                <p>
                  Professional laundry and fabric care for clothes, bedding, and
                  more. We use gentle methods to keep your garments fresh.
                </p>
              </div>
              <div className="cleaning-service-card">
                <div className="cleaning-service-icon">
                  <Users size={32} />
                </div>
                <h3>Specialized Cleaning</h3>
                <p>
                  Fumigation, carpet cleaning, window washing, and more. We
                  handle all your special cleaning requirements with expertise.
                </p>
              </div>
              <div className="cleaning-service-card">
                <div className="cleaning-service-icon">
                  <Clock size={32} />
                </div>
                <h3>Emergency Cleanup</h3>
                <p>
                  Need urgent cleaning? Our rapid response team is available for
                  emergency situations and urgent cleaning needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="cleaning-why-section">
          <div className="cleaning-container">
            <div className="cleaning-why-content">
              <h2 className="cleaning-why-title">
                Why Choose Bitnox Cleaning?
              </h2>
              <p className="cleaning-why-description">
                Reclaim your precious free time with Bitnox Cleaning Services.
                Our expertly trained team provides exceptional home cleaning,
                laundry, post-construction cleanup, and office cleaning. With
                thousands of 5-star reviews and satisfied customers, you can
                trust us to handle all your cleaning needs. Start living more
                and cleaning less. Focus on what truly matters.
              </p>
              <button className="cleaning-why-cta">Relax. It's Done.</button>
            </div>
            <div className="cleaning-why-image">
              <div className="cleaning-why-image-placeholder">
                <img src={CleaningImage} alt="" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="cleaning-features-section">
          <div className="cleaning-container">
            <h2 className="cleaning-section-title">Our Guarantee</h2>
            <div className="cleaning-features-grid">
              <div className="cleaning-feature-card">
                <div className="cleaning-feature-icon">✓</div>
                <h3>Quality Assured</h3>
                <p>
                  100% satisfaction guaranteed. If you're not completely
                  satisfied, we'll return to make it right—for free.
                </p>
              </div>
              <div className="cleaning-feature-card">
                <div className="cleaning-feature-icon">✓</div>
                <h3>Trained Professionals</h3>
                <p>
                  All our team members are thoroughly vetted,
                  background-checked, and trained in industry best practices.
                </p>
              </div>
              <div className="cleaning-feature-card">
                <div className="cleaning-feature-icon">✓</div>
                <h3>Eco-Friendly Products</h3>
                <p>
                  We use safe, environmentally responsible cleaning products
                  that are effective and gentle for your family.
                </p>
              </div>
              <div className="cleaning-feature-card">
                <div className="cleaning-feature-icon">✓</div>
                <h3>Flexible Scheduling</h3>
                <p>
                  Schedule cleaning at your convenience. We offer flexible
                  recurring plans or one-time deep cleans.
                </p>
              </div>
              <div className="cleaning-feature-card">
                <div className="cleaning-feature-icon">✓</div>
                <h3>Insured & Bonded</h3>
                <p>
                  Complete peace of mind with our comprehensive insurance and
                  bonding coverage for all services.
                </p>
              </div>
              <div className="cleaning-feature-card">
                <div className="cleaning-feature-icon">✓</div>
                <h3>24/7 Support</h3>
                <p>
                  Our customer support team is always available to answer
                  questions or handle special requests.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
