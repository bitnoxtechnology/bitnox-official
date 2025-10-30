import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Github,
  ArrowUpRight,
  Send
} from "lucide-react";
import "../Styles/Footer.css";

gsap.registerPlugin(ScrollTrigger);

function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    setEmail("");
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate sections on scroll
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          gsap.from(section, {
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "top 70%",
              scrub: 1,
            },
            opacity: 0,
            y: 60,
            duration: 0.8,
            delay: index * 0.1,
          });
        }
      });

      // Animate CTA
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 90%",
            end: "top 70%",
            scrub: 1,
          },
          opacity: 0,
          scale: 0.95,
          duration: 1,
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-container">
        {/* Newsletter */}
        <div className="footer-newsletter" ref={ctaRef}>
          <div className="newsletter-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Subscribe to our newsletter for the latest updates, tech insights, and exclusive offers.
            </p>
          </div>
          <div className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-wrapper">
              <Mail className="newsletter-icon" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="button" className="newsletter-button" onClick={handleSubscribe}>
              <span>Subscribe</span>
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Company Column */}
          <div
            className="footer-column"
            ref={(el) => { if (el) sectionsRef.current[0] = el; }}
          >
            <div className="footer-brand">
              <h3 className="footer-brand-name">Bitnox Solution</h3>
              <p className="footer-brand-tagline">Innovate. Transform. Excel.</p>
            </div>
            <p className="footer-description">
              Transforming businesses with cutting-edge IT solutions, comprehensive tech education, and reliable support services since 2016.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">180+</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Clients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">8+</span>
                <span className="stat-label">Years</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div
            className="footer-column"
            ref={(el) => { if (el) sectionsRef.current[1] = el; }}
          >
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li>
                <a href="#about" className="footer-link">
                  <span>About Us</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#services" className="footer-link">
                  <span>Our Services</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#portfolio" className="footer-link">
                  <span>Portfolio</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#team" className="footer-link">
                  <span>Our Team</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#careers" className="footer-link">
                  <span>Careers</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div
            className="footer-column"
            ref={(el) => { if (el) sectionsRef.current[2] = el; }}
          >
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li>
                <a href="#web-dev" className="footer-link">
                  <span>Web Development</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#mobile-dev" className="footer-link">
                  <span>Mobile Apps</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="https://edu.bitnoxsolution.com" className="footer-link">
                  <span>Tech Education</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#consulting" className="footer-link">
                  <span>IT Consulting</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
              <li>
                <a href="#support" className="footer-link">
                  <span>24/7 Support</span>
                  <ArrowUpRight size={16} />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div
            className="footer-column"
            ref={(el) => { if (el) sectionsRef.current[3] = el; }}
          >
            <h4 className="footer-heading">Get in Touch</h4>
            <div className="footer-contact">
              <a href="tel:+2348137192766" className="contact-item">
                <div className="contact-icon-wrapper">
                  <Phone size={18} />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Call us</span>
                  <span className="contact-value">+234 813 719 2766</span>
                </div>
              </a>

              <a href="mailto:info@bitnoxsolution.com" className="contact-item">
                <div className="contact-icon-wrapper">
                  <Mail size={18} />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Email us</span>
                  <span className="contact-value">info@bitnoxsolution.com</span>
                </div>
              </a>

              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={18} />
                </div>
                <div className="contact-info">
                  <span className="contact-label">Visit us</span>
                  <span className="contact-value">Abeokuta, Nigeria</span>
                </div>
              </div>
            </div>

            <div className="footer-social">
              <a href="https://www.facebook.com/bitnoxsolution" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/bitnoxsolution" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://github.com" className="social-link" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Bitnox Solution. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="footer-decoration"></div>
    </footer>
  );
}

export default Footer;