import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Monitor, Target, Sparkles, Stars } from "lucide-react";
import "../styles/About.css";

gsap.registerPlugin(ScrollTrigger);

function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.from(headingRef.current.children, {
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
          },
          opacity: 0,
          y: 50,
          stagger: 0.2,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Content fade in
      if (contentRef.current) {
        gsap.from(contentRef.current.children, {
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
          },
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
        });
      }

      // Cards animation
      const validCards = cardsRef.current.filter((card) => card !== null);
      if (validCards.length > 0) {
        validCards.forEach((card) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
            opacity: 0,
            y: 60,
            scale: 0.95,
            duration: 0.8,
            ease: "back.out(1.2)",
          });
        });
      }

      // Stats counter animation
      if (statsRef.current) {
        const statNumbers = statsRef.current.querySelectorAll(".stat-number");
        statNumbers.forEach((num) => {
          const target = num.getAttribute("data-target");
          if (target) {
            gsap.from(num, {
              scrollTrigger: {
                trigger: statsRef.current,
                start: "top 80%",
              },
              innerText: 0,
              duration: 2,
              snap: { innerText: 1 },
              ease: "power1.inOut",
            });
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const services = [
    {
      icon: Monitor,
      title: "Tech Training & Development",
      description:
        "Comprehensive training programs in web development, data analytics, and digital marketing. We equip individuals and businesses with cutting-edge digital skills through hands-on, practical learning experiences.",
    },
    {
      icon: Target,
      title: "IT Consultation",
      description:
        "Expert guidance and strategic IT solutions tailored to your business needs. From infrastructure planning to digital transformation, our certified professionals provide world-class consultation services.",
    },
    {
      icon: Sparkles,
      title: "Laundry & Cleaning Services",
      description:
        "Premium residential and commercial cleaning services. We bring the same precision and excellence to your lifestyle needs with pickup & delivery, dry cleaning, and comprehensive office cleaning solutions.",
    },
  ];

  const stats = [
    { number: "8", suffix: "+", label: "Years Experience" },
    { number: "180", suffix: "+", label: "Projects Delivered" },
    { number: "100", suffix: "+", label: "Happy Clients" },
    { number: "24", suffix: "/7", label: "Support Available" },
  ];

  return (
    <section ref={sectionRef} className="about-section" id="about">
      <div className="about-container">
        {/* Section Heading */}
        <div ref={headingRef} className="about-heading">
          <span className="about-label">WHO WE ARE</span>
          <h2 className="about-title">
            Building Digital Futures & Enhancing Lifestyles
          </h2>
          <div className="title-underline"></div>
        </div>

        {/* Main Content */}
        <div ref={contentRef} className="about-content">
          <p className="about-intro">
            <strong>Bitnox Technology Solutions Ltd</strong> is a dynamic,
            forward-thinking company based in Nigeria, offering a unique blend
            of professional services across technology and lifestyle.
          </p>

          <p className="about-text">
            We specialize in <strong>Tech Training</strong>,{" "}
            <strong>IT Consultation</strong>, and{" "}
            <strong>Digital Skills Development</strong> equipping individuals
            and businesses with the tools they need to thrive in today's
            fast-paced digital world. Whether you're a student, entrepreneur, or
            company looking to scale your operations, our hands-on training and
            expert guidance make tech simple, practical, and impactful.
          </p>

          <p className="about-text">
            In addition to our technology services, we run a trusted{" "}
            <strong>Laundry and Cleaning</strong> arm that brings the same level
            of precision and excellence to your everyday life. From residential
            laundry to commercial cleaning, Bitnox delivers convenience and
            cleanliness you can count on.
          </p>
        </div>

        {/* Service Cards */}
        <div className="services-grid">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="service-card"
              >
                <div className="service-icon">
                  <IconComponent size={48} strokeWidth={1.5} />
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="card-gradient"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default About;
