import React, { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/Portfolio.css";
import ImageOne from "../assets/projectOne.png";
import ImageTwo from "../assets/projectTwo.png";
import ProvisionCIC from "../assets/provisioncic.png";
import ImageFour from "../assets/projectFour.png";
import ImageFive from "../assets/projectFive.png";
import ImageSix from "../assets/projectSix.png";
import ImageSeven from "../assets/projectSeven.png";
import BabadelEstates from "../assets/babadelestates.png";

gsap.registerPlugin(ScrollTrigger);

function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Sample portfolio data - replace with your actual projects
  const projects = [
    {
      id: 1,
      title: "Clean Axis",
      description:
        "Clean Axis deliver end of tenancy cleaning, deep cleaning, after builders cleaning, carpet cleaning, commercial cleaning, and jet/pressure washing across Coventry, Solihull, Birmingham, Warwick, Leamington Spa, Rugby and more.",
      image: ImageOne,
      link: "https://cleanaxis.uk",
      tags: ["Next.js", "Graphql", "Cleaning", "Booking"],
    },
    {
      id: 2,
      title: "Bitnox Technology Training",
      description:
        "A digital training center offering structured, no-fluff courses designed to build practical tech skills. Features bite-sized lessons, hands-on projects, and expert instructors helping students master React, MongoDB, Node.js and other technologies with a clear learning path.",
      image: ImageTwo,
      link: "https://edu.bitnoxsolution.com",
      tags: ["Next.js", "EdTech", "LMS"],
    },
    {
      id: 3,
      title: "ProVision Support Services",
      description:
        "A UK-based Community Interest Company (CIC) providing distinctive accommodation services with a focus on sustainability and exceptional guest experiences. Empowers investments while celebrating stays and elevating experiences for communities across the United Kingdom.",
      image: ProvisionCIC,
      link: "https://www.provisionsupportservice.co.uk",
      tags: ["React", "CIC", "Hospitality"],
    },
    {
      id: 8,
      title: "Babadel Estates Ltd",
      description:
        "Babadel Estates is your trusted UK property partner — from sourcing and flipping to sales, management, and social housing. We turn property ambitions into generational wealth.",
      image: BabadelEstates,
      link: "https://www.babadelestates.co.uk",
      tags: ["Nextjs", "Real Estate", "Property"],
    },
    {
      id: 4,
      title: "Dexcraft Agency",
      description:
        "A full-service digital agency specializing in web design, development, and digital marketing solutions. Creates stunning digital presences for brands through strategic design, user experience optimization, and innovative web solutions that drive business growth.",
      image: ImageFour,
      link: "https://www.dexcraft.agency",
      tags: ["Portfolio", "Agency", "Web Design"],
    },
    {
      id: 5,
      title: "Remigella International Group",
      description:
        "Recognized as one of Africa's leading diversified conglomerate, providing quality services that exceed customer expectations while creating sustainable value for their stakeholders and contributing positively to the communities they serve.",
      image: ImageFive,
      link: "https://www.remigellagroup.com/",
      tags: ["GOC", "NGO", "Company"],
    },
    {
      id: 6,
      title: "International Dance Nigeria",
      description:
        "They nurture, showcase and export Nigerian dance talent by providing opportunities for education, performance and international competition — while preserving cultural identity and creative innovation.",
      image: ImageSix,
      link: "https://www.internationaldance.ng/",
      tags: ["Dance", "DWC", "Entertainment"],
    },
    {
      id: 7,
      title: "Ask Community",
      description:
        "A developer community platform where learners can ask programming related questions and get quality answers from experienced developers.",
      image: ImageSeven,
      link: "https://askcom.bitnoxsolution.com/",
      tags: ["Programming", "IT", "Questions", "Answers"],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
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

      // Animate cards with stagger
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
  }, []);

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const image = card.querySelector(".portfolio-card-image");
    const overlay = card.querySelector(".portfolio-card-overlay");

    gsap.to(image, {
      scale: 1.1,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const image = card.querySelector(".portfolio-card-image");
    const overlay = card.querySelector(".portfolio-card-overlay");

    gsap.to(image, {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
    });
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
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="portfolio-card"
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
            >
              <div className="portfolio-card-image-wrapper">
                <img
                  src={project.image}
                  alt={project.title}
                  className="portfolio-card-image"
                />
                <div className="portfolio-card-overlay"></div>
              </div>

              <div className="portfolio-card-content">
                <div className="portfolio-card-tags">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="portfolio-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="portfolio-card-title">{project.title}</h3>
                <p className="portfolio-card-description">
                  {project.description}
                </p>

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-card-link"
                >
                  <span>View Project</span>
                  <ArrowUpRight className="portfolio-link-icon" size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
