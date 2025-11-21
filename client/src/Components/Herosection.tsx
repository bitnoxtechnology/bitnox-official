import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../styles/Herosection.css";
import HeroImage from "../assets/HeroImage.svg";

function Herosection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for sequential animations
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Title animation - split and stagger
      if (titleRef.current) {
        const titleChars = titleRef.current.querySelectorAll(".char");
        tl.from(titleChars, {
          opacity: 0,
          y: 100,
          rotationX: -90,
          stagger: 0.02,
          duration: 1,
        });
      }

      // Description fade in
      if (descRef.current) {
        tl.from(
          descRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          "-=0.5"
        );
      }

      // Buttons slide up
      if (buttonsRef.current) {
        const buttons = buttonsRef.current.querySelectorAll(".hero-button");
        tl.from(
          buttons,
          {
            opacity: 1,
            y: 40,
            stagger: 0.2,
            duration: 0.8,
          },
          "-=0.4"
        );
      }

      // Metrics count up animation
      if (metricsRef.current) {
        const metricItems = metricsRef.current.querySelectorAll(".metric-item");
        tl.from(
          metricItems,
          {
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.6,
          },
          "-=0.3"
        );

        // Number count up animation
        const numbers = metricsRef.current.querySelectorAll(".metric-number");
        numbers.forEach((num) => {
          const target = num.getAttribute("data-target");
          if (target) {
            gsap.to(num, {
              innerText: target,
              duration: 2,
              snap: { innerText: 1 },
              ease: "power1.inOut",
              delay: 0.5,
            });
          }
        });
      }

      // Hero image reveal
      if (imageRef.current) {
        tl.from(
          imageRef.current,
          {
            opacity: 0,
            scale: 0.8,
            x: 100,
            duration: 1.2,
            ease: "back.out(1.4)",
          },
          "-=1"
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // text animation
  const splitText = (text: string) => {
    return text.split("").map((char, index) => (
      <span key={index} className="char">
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  const metrics = [
    {
      number: "50",
      suffix: "+",
      label: "Projects Completed",
      isSymbol: false,
    },
    { number: "30", suffix: "+", label: "Happy Clients", isSymbol: false },
    { number: "∞", suffix: "", label: "Innovative Solutions", isSymbol: true },
  ];

  return (
    <section ref={heroRef} className="hero-section">
      <div className="hero-container">
        {/* Left Content */}
        <div className="hero-content">
          <h1 ref={titleRef} className="hero-title">
            {splitText("Transforming Your Business")}
            <br />
            {splitText("With IT Solutions")}
          </h1>

          <p ref={descRef} className="hero-description">
            Elevate your business with comprehensive IT solutions tailored to
            your needs. From web development to cloud infrastructure, we deliver
            excellence in every project. Our team of certified professionals
            brings over 8 years of industry expertise to transform your digital
            presence and drive innovation.
          </p>

          <div ref={buttonsRef} className="hero-buttons">
            <a href="/contact">
              <button className="hero-button primary">Get Started</button>
            </a>
            <a href="https://wa.me/2348137192766">
              <button className="hero-button secondary">Consultation</button>
            </a>
          </div>

          <div ref={metricsRef} className="hero-metrics">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-value">
                  {metric.isSymbol ? (
                    <span className="metric-number">{metric.number}</span>
                  ) : (
                    <span className="metric-number" data-target={metric.number}>
                      0
                    </span>
                  )}
                  <span className="metric-suffix">{metric.suffix}</span>
                </div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div ref={imageRef} className="hero-image-container">
          <img src={HeroImage} alt="Bitnox Solutions" className="hero-image" />
        </div>
      </div>
    </section>
  );
}

export default Herosection;
