"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react"
import "../Styles/Footer.css"

function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!footerRef.current) return

    // Animate footer on mount
    gsap.from(footerRef.current, {
      opacity: 1,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
    })

    // Animate links
    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll(".footer-link")
      gsap.from(links, {
        opacity: 1,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      })
    }

    // Animate contact items
    if (contactRef.current) {
      const items = contactRef.current.querySelectorAll(".contact-item")
      gsap.from(items, {
        opacity: 1,
        x: -20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.3,
      })
    }

    // Animate social icons
    if (socialRef.current) {
      const icons = socialRef.current.querySelectorAll(".social-icon")
      gsap.from(icons, {
        opacity: 1,
        scale: 0.5,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out",
        delay: 0.4,
      })
    }
  }, [])

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">Bitnox Solution</h3>
            <p className="footer-description">
              Transforming businesses with comprehensive IT support and innovative digital solutions.
            </p>
            <p className="footer-tagline">Delivering excellence since 2016</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section" ref={linksRef}>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#services" className="footer-link">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="footer-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="#portfolio" className="footer-link">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#team" className="footer-link">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#blog" className="footer-link">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section" ref={linksRef}>
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li>
                <a href="#software" className="footer-link">
                  Software Solutions
                </a>
              </li>
              <li>
                <a href="#education" className="footer-link">
                  Tech Education
                </a>
              </li>
              <li>
                <a href="#cleaning" className="footer-link">
                  Cleaning Services
                </a>
              </li>
              <li>
                <a href="#consulting" className="footer-link">
                  Consulting
                </a>
              </li>
              <li>
                <a href="#support" className="footer-link">
                  24/7 Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section" ref={contactRef}>
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-items">
              <div className="contact-item">
                <Phone size={20} className="contact-icon" />
                <div>
                  <p className="contact-label">Phone</p>
                  <a href="tel:+2348137192766" className="contact-link">
                    +234 813 719 2766
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={20} className="contact-icon" />
                <div>
                  <p className="contact-label">Email</p>
                  <a href="mailto:info@bitnoxsolution.com" className="contact-link">
                    info@bitnoxsolution.com
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <MapPin size={20} className="contact-icon" />
                <div>
                  <p className="contact-label">Address</p>
                  <p className="contact-link">Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="footer-social" ref={socialRef}>
          <h4 className="footer-heading">Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" className="social-icon" aria-label="Twitter">
              <Twitter size={24} />
            </a>
            <a href="https://linkedin.com" className="social-icon" aria-label="LinkedIn">
              <Linkedin size={24} />
            </a>
            <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
              <Instagram size={24} />
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="footer-cta">
          <h3>Ready to start your project?</h3>
          <a href="#contact" className="cta-button">
            Get Started <ArrowRight size={20} />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; 2025 Bitnox Solution. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookies">Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
