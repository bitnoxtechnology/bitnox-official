"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Zap, Shield, Users, Award } from "lucide-react";
import "../Styles/AboutPage.css";
import Team1 from "../assets/Team1.jpg";
import Team2 from "../assets/Team2.jpg";
import Team3 from "../assets/Team3.jpg";
import Team4 from "../assets/Team4.jpg";
import Meta from "../Components/Meta";

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
  const containerRef = useRef(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    if (typeof window !== "undefined") {
      const isDarkMode =
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(isDarkMode);
      if (isDarkMode) document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".aboutpage-hero-title", {
        opacity: 1,
        y: 60,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".aboutpage-hero-subtitle", {
        opacity: 1,
        y: 40,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".aboutpage-hero-cta", {
        opacity: 1,
        y: 20,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });

      // Service cards animation
      gsap.from(".aboutpage-service-card", {
        opacity: 1,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".aboutpage-services-section",
          start: "top center",
        },
        ease: "power2.out",
      });

      // Values section animation
      gsap.from(".aboutpage-value-item", {
        opacity: 1,
        x: -40,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".aboutpage-values-section",
          start: "top center",
        },
        ease: "power2.out",
      });

      // Team cards animation
      gsap.from(".aboutpage-team-card", {
        opacity: 1,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".aboutpage-team-section",
          start: "top center",
        },
        ease: "back.out(1.2)",
      });

      // Hover animations
      document.querySelectorAll(".aboutpage-service-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { y: -10, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
        });
      });

      document.querySelectorAll(".aboutpage-team-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { scale: 1.05, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <>
      <Meta title="About Us | Bitnox Technology" />
      <div ref={containerRef} className="aboutpage">
        {/* Hero Section */}
        <section className="aboutpage-hero-section">
          <div className="aboutpage-hero-pattern"></div>
          <div className="aboutpage-hero-content">
            <p className="aboutpage-hero-label">About Us</p>
            <h1 className="aboutpage-hero-title">
              Innovative Technology Solutions
            </h1>
            <p className="aboutpage-hero-description">
              We deliver cutting-edge digital solutions that transform
              businesses and drive growth through innovation and expertise.
            </p>
            <a href="#aboutpage-services">
              <button className="aboutpage-hero-cta">
                Learn More <ArrowRight size={20} />
              </button>
            </a>
          </div>
        </section>

        {/* Overview Section */}
        <section className="aboutpage-overview-section">
          <div className="aboutpage-overview-container">
            <div className="aboutpage-overview-content">
              <h2>Who We Are</h2>
              <p>
                Bitnox Solutions is a forward-thinking technology company
                dedicated to delivering cutting-edge digital solutions. With a
                team of passionate experts, we transform businesses through
                innovation, expertise, and unwavering commitment to excellence.
              </p>
              <p>
                Since our founding, we've partnered with leading organizations
                to solve complex challenges and unlock new opportunities in the
                digital landscape.
              </p>
            </div>
            <div className="aboutpage-overview-stats">
              <div className="aboutpage-stat-card">
                <h3>50+</h3>
                <p>Projects Completed</p>
              </div>
              <div className="aboutpage-stat-card">
                <h3>8+</h3>
                <p>Team Members</p>
              </div>
              <div className="aboutpage-stat-card">
                <h3>6+</h3>
                <p>Years Experience</p>
              </div>
              <div className="aboutpage-stat-card">
                <h3>99%</h3>
                <p>Client Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="aboutpage-services-section">
          <h2 className="aboutpage-section-title" id="aboutpage-services">
            Our Services
          </h2>
          <div className="aboutpage-services-grid">
            <div className="aboutpage-service-card">
              <div className="aboutpage-service-icon">
                <Zap />
              </div>
              <h3>Custom Development</h3>
              <p>
                Tailored software solutions built specifically for your business
                needs and requirements.
              </p>
            </div>

            <div className="aboutpage-service-card">
              <div className="aboutpage-service-icon">
                <Shield />
              </div>
              <h3>Security Solutions</h3>
              <p>
                Enterprise-grade security infrastructure to protect your digital
                assets and data.
              </p>
            </div>

            <div className="aboutpage-service-card">
              <div className="aboutpage-service-icon">
                <Award />
              </div>
              <h3>Cloud Solutions</h3>
              <p>
                Scalable cloud infrastructure designed for performance,
                reliability, and growth.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="aboutpage-values-section">
          <h2 className="aboutpage-section-title">Our Core Values</h2>
          <div className="aboutpage-values-container">
            <div className="aboutpage-value-item">
              <div className="aboutpage-value-number">01</div>
              <h3>Innovation</h3>
              <p>
                We continuously push boundaries and embrace emerging
                technologies to deliver next-generation solutions.
              </p>
            </div>

            <div className="aboutpage-value-item">
              <div className="aboutpage-value-number">02</div>
              <h3>Excellence</h3>
              <p>
                Uncompromising quality and attention to detail in every project
                we undertake.
              </p>
            </div>

            <div className="aboutpage-value-item">
              <div className="aboutpage-value-number">03</div>
              <h3>Integrity</h3>
              <p>
                Transparent communication and ethical practices form the
                foundation of our partnerships.
              </p>
            </div>

            <div className="aboutpage-value-item">
              <div className="aboutpage-value-number">04</div>
              <h3>Collaboration</h3>
              <p>
                We believe in the power of teamwork and partnering closely with
                our clients.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="aboutpage-team-section">
          <h2 className="aboutpage-section-title">Our Leadership Team</h2>
          <div className="aboutpage-team-grid">
            {[
              {
                name: "Oluwafemi Faleye",
                role: "Founder & Software Engineer",
                photo: Team1,
              },
              {
                name: "Adefemi Sanyaolu",
                role: "Cloud & Data Engineer",
                photo: Team2,
              },
              {
                name: "Bello Oladimeji",
                role: "Web Developer",
                photo: Team3,
              },
              {
                name: "Tobiloba David",
                role: "Product Designer",
                photo: Team4,
              },
            ].map((member, index) => (
              <div key={index} className="aboutpage-team-card">
                <div className="aboutpage-team-image">
                  <img src={member.photo} alt={member.name} />
                </div>
                <div className="aboutpage-team-info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
