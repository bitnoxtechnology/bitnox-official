"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import "../Styles/AboutPage.css"

gsap.registerPlugin(ScrollTrigger)

function AboutUs() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
        })
      }

      // Content animation
      if (contentRef.current) {
        gsap.from(contentRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="about-page-container">
      <div className="aboutpage">
        <h1 ref={titleRef} className="about-page-title">
          About Us
        </h1>
        <div ref={contentRef} className="about-page-content">
          <p>We are a team of passionate professionals dedicated to delivering exceptional solutions.</p>
          <p>Our mission is to help businesses grow and succeed through innovative technology and dedicated support.</p>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
