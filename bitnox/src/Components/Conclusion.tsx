"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react"
import "../Styles/Conclusion.css"

gsap.registerPlugin(ScrollTrigger)

interface StatItem {
  value: number
  label: string
  suffix: string
}

interface SkillItem {
  name: string
  percentage: number
}

const Conclusion = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const stats: StatItem[] = [
    { value: 96, label: "Success Rate on All Projects", suffix: "%" },
    { value: 95, label: "Success Rate on Cleaning & Laundry", suffix: "%" },
    { value: 96, label: "Success Rate on Software Development", suffix: "%" },
    { value: 96, label: "Success Rate on Tech Training", suffix: "%" },
  ]

  const skills: SkillItem[] = [
    { name: "Product Design", percentage: 95 },
    { name: "Software Development", percentage: 100 },
    { name: "Tech Education", percentage: 95 },
    { name: "Cleaning & Laundry", percentage: 90 },
  ]

  useEffect(() => {
    // Success section animations
    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll(".stat-item")
      gsap.from(statItems, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 1,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })

      // Animate stat bars and counters
      statItems.forEach((item: Element, index: number) => {
        const statFill = item.querySelector(".stat-fill")
        const statValue = item.querySelector(".stat-value")
        const stat = stats[index]

        gsap.to(statFill, {
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            once: true,
          },
          width: `${stat.value}%`,
          duration: 1.5,
          ease: "power2.out",
          delay: 0.3,
        })

        // Counter animation
        const counter = { value: 0 }
        gsap.to(counter, {
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            once: true,
          },
          value: stat.value,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            if (statValue) {
              statValue.textContent = Math.floor(counter.value) + stat.suffix
            }
          },
        })
      })
    }

    // Skills section animations
    if (skillsRef.current) {
      const skillItems = skillsRef.current.querySelectorAll(".skill-item")
      gsap.from(skillItems, {
        scrollTrigger: {
          trigger: skillsRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 1,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })

      // Animate skill bars
      skillItems.forEach((item: Element, index: number) => {
        const skillFill = item.querySelector(".skill-fill")
        const skillPercentage = item.querySelector(".skill-percentage")
        const skill = skills[index]

        gsap.to(skillFill, {
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            once: true,
          },
          width: `${skill.percentage}%`,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.2 + index * 0.1,
        })

        // Counter animation for skill percentage
        const counter = { value: 0 }
        gsap.to(counter, {
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            once: true,
          },
          value: skill.percentage,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.2 + index * 0.1,
          onUpdate: () => {
            if (skillPercentage) {
              skillPercentage.textContent = Math.floor(counter.value) + "%"
            }
          },
        })
      })
    }

    // Contact section animations
    if (contactRef.current) {
      const contactCards = contactRef.current.querySelectorAll(".contact-card")
      gsap.from(contactCards, {
        scrollTrigger: {
          trigger: contactRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 1,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })

      // Hover animation for contact cards
      contactCards.forEach((card: Element) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -10,
            duration: 0.3,
            ease: "power2.out",
          })
        })
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          })
        })
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div className="conclusion-container" ref={containerRef}>
      {/* Our Success Section */}
      <section className="success-section">
        <div className="section-header">
          <h2 className="testimonial-title">Our Success</h2>
          <p className="testimonial-subtitle">We have provided solutions for more than 100 clients worldwide</p>
          <p className="section-description">
            Our professionalism has helped us achieve this milestone in our business. We provide the best solutions,
            work with us today!
          </p>
        </div>

        {/* Success Stats Bar */}
        <div className="stats-grid" ref={statsRef}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-content">
                <div className="stat-value">0{stat.suffix}</div>
                <p className="stat-label">{stat.label}</p>
              </div>
              <div className="stat-bar">
                <div className="stat-fill" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <div className="section-header">
          <h2 className="testimonial-title">Our Skills</h2>
          <p className="testimonial-subtitle">We have experts in their respective fields</p>
          <p className="section-description">
            Bitnox Technology is filled with world-class talent that specializes in providing comprehensive range of
            services to help businesses thrive in the digital age.
          </p>
        </div>

        <div className="skills-grid" ref={skillsRef}>
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <div className="skill-header">
                <h3 className="skill-name">{skill.name}</h3>
                <span className="skill-percentage">0%</span>
              </div>
              <div className="skill-bar">
                <div className="skill-fill" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-header">
          <h2 className="testimonial-title">Get In Touch</h2>
          <p className="testimonial-subtitle">Let's breathe your concept into existence</p>
        </div>

        <div className="contact-grid" ref={contactRef}>
          <div className="contact-card">
            <div className="contact-icon">
              <Phone size={32} />
            </div>
            <h3>Phone</h3>
            <p>
              <a href="tel:+2348137192766">+234 813 719 2766</a>
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <Mail size={32} />
            </div>
            <h3>Email</h3>
            <p>
              <a href="mailto:info@bitnoxsolution.com">info@bitnoxsolution.com</a>
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <MapPin size={32} />
            </div>
            <h3>Address</h3>
            <p>Lagos, Nigeria</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <MessageCircle size={32} />
            </div>
            <h3>WhatsApp</h3>
            <p>
              <a href="https://wa.me/2348137192766">Chat with us</a>
            </p>
          </div>
        </div>

      </section>
    </div>
  )
}

export default Conclusion
