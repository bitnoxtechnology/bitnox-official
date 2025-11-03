import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Award, Zap, Clock } from "lucide-react";
import "../Styles/WhyUs.css";

gsap.registerPlugin(ScrollTrigger);

function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const visualsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.from(titleRef.current.children, {
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 75%",
          },
          opacity: 0,
          y: 60,
          stagger: 0.2,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Content parallax
      if (contentRef.current) {
        gsap.from(contentRef.current, {
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
          y: 50,
          opacity: 0.8,
        });
      }

      // Cards staggered animation with parallax
      const validCards = cardsRef.current.filter((card) => card !== null);
      validCards.forEach((card, index) => {
        // Initial reveal
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          opacity: 0,
          x: index % 2 === 0 ? -100 : 100,
          rotationY: index % 2 === 0 ? -15 : 15,
          duration: 1,
          ease: "power3.out",
        });

        // Continuous parallax on scroll
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
          y: index % 2 === 0 ? -30 : 30,
        });
      });

      // Floating visuals parallax
      const validVisuals = visualsRef.current.filter((v) => v !== null);
      validVisuals.forEach((visual, index) => {
        gsap.to(visual, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          y: (index + 1) * -80,
          rotation: (index + 1) * 20,
          ease: "none",
        });

        // Initial animation
        gsap.from(visual, {
          scrollTrigger: {
            trigger: visual,
            start: "top 90%",
          },
          scale: 0,
          rotation: 180,
          duration: 1,
          ease: "back.out(2)",
        });
      });

      // Hover effects for cards
      validCards.forEach((card) => {
        card?.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        card?.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const reasons = [
    {
      icon: Users,
      title: "DEDICATED TEAMS",
      description:
        "Our passionate team of experts work collaboratively to deliver outstanding results. We're committed to understanding your unique needs and exceeding expectations.",
      color: "#05E4FC",
    },
    {
      icon: Award,
      title: "CERTIFIED PROFESSIONALS",
      description:
        "World-class talent with industry certifications and proven expertise. Our professionals stay updated with latest technologies to provide cutting-edge solutions.",
      color: "#05a1f0ff",
    },
    {
      icon: Zap,
      title: "PROMPT & CUSTOMER FOCUSED",
      description:
        "Lightning-fast responses and unwavering focus on your success. We prioritize your satisfaction and deliver solutions that drive real business value.",
      color: "#05E4FC",
    },
    {
      icon: Clock,
      title: "24/7 SUPPORT TEAM",
      description:
        "Round-the-clock support whenever you need us. Our dedicated support team ensures your operations run smoothly without interruption.",
      color: "#05a1f0ff",
    },
  ];

  return (
    <section ref={sectionRef} className="whyus-section" id="why-us">
      <div className="whyus-container">
        {/* Section Title */}
        <div ref={titleRef} className="whyus-title">
          <span className="whyus-label">WHY BITNOX TECHNOLOGY?</span>
          <h2 className="section-heading">
            We Have Over 6+ Years Experience
            <br />
            In The Tech Industry
          </h2>
          <p className="section-subheading">
            Navigating the realm of innovation, Bitnox Technology Solutions
            provide comprehensive range of services to help businesses thrive.
            Our mission is to provide world-class solutions to businesses and
            individuals.
          </p>
        </div>

        {/* Main Content Area */}
        <div ref={contentRef} className="whyus-content">
          {/* Reason Cards */}
          <div className="reasons-grid">
            {reasons.map((reason, index) => {
              const IconComponent = reason.icon;
              return (
                <div
                  key={index}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className="reason-card"
                  style={
                    { "--card-color": reason.color } as React.CSSProperties
                  }
                >
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="reason-icon">
                      <IconComponent size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="reason-title">{reason.title}</h3>
                    <p className="reason-description">{reason.description}</p>
                  </div>
                  <div className="card-shine"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="decorative-grid"></div>
      </div>

      {/* Animated Background */}
      <div className="whyus-background">
        <div className="bg-gradient-orb-1"></div>
        <div className="bg-gradient-orb-2"></div>
        <div className="bg-gradient-orb-3"></div>
      </div>
    </section>
  );
}

export default WhyUs;
