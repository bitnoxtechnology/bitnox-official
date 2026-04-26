import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/Portfolio.css";
import { portfolioService } from "@/lib/services/portfolio-service";
import PortfolioCardSkeleton from "./skeleton/PortfolioCardSkeleton";

gsap.registerPlugin(ScrollTrigger);

function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    portfolioService
      .getAllProjects({ isPublished: true, limit: 20 })
      .then((res) => {
        if (res.success && res.data?.projects) {
          setProjects(res.data.projects);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading || projects.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
        opacity: 0,
        y: 50,
        duration: 1,
      });

      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 60%",
              scrub: 1,
            },
            opacity: 0,
            y: 80,
            duration: 1,
            delay: index * 0.1,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projects, isLoading]);

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const image = card.querySelector(".portfolio-card-image");
    const overlay = card.querySelector(".portfolio-card-overlay");

    gsap.to(image, { scale: 1.1, duration: 0.6, ease: "power2.out" });
    gsap.to(overlay, { opacity: 1, duration: 0.4, ease: "power2.out" });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const image = card.querySelector(".portfolio-card-image");
    const overlay = card.querySelector(".portfolio-card-overlay");

    gsap.to(image, { scale: 1, duration: 0.6, ease: "power2.out" });
    gsap.to(overlay, { opacity: 0, duration: 0.4, ease: "power2.out" });
  };

  return (
    <section className="portfolio-section" ref={sectionRef}>
      <div className="portfolio-container">
        <div className="portfolio-header" ref={titleRef}>
          <h2 className="testimonial-title">Our Portfolio</h2>
          <p className="portfolio-subtitle">
            Explore our latest projects and creative solutions delivered for
            clients worldwide
          </p>
        </div>

        <div className="portfolio-grid">
          {isLoading ? (
            <>
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
            </>
          ) : projects.length === 0 ? (
            <div className="portfolio-empty">No projects to display yet.</div>
          ) : (
            projects.map((project, index) => (
              <div
                key={project._id}
                className="portfolio-card"
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                onMouseEnter={handleCardHover}
                onMouseLeave={handleCardLeave}
              >
                <div className="portfolio-card-image-wrapper">
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="portfolio-card-image"
                    />
                  ) : (
                    <div className="portfolio-card-image portfolio-card-image-placeholder" />
                  )}
                  <div className="portfolio-card-overlay"></div>
                </div>

                <div className="portfolio-card-content">
                  <div className="portfolio-card-tags">
                    {project.tags?.map((tag, idx) => (
                      <span key={idx} className="portfolio-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="portfolio-card-title">{project.title}</h3>
                  <p className="portfolio-card-description">
                    {project.description}
                  </p>

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portfolio-card-link"
                    >
                      <span>View Project</span>
                      <ArrowUpRight className="portfolio-link-icon" size={18} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
