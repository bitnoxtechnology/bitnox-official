"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Mail, Phone, MapPin, Plus, Minus } from "lucide-react"
import { useState } from "react"
import "../Styles/ContactPage.css"

gsap.registerPlugin(ScrollTrigger)

const faqs = [
  {
    question: "What are your business hours?",
    answer:
      "We operate 24/7 to serve your needs. Our hotline is available round the clock for urgent inquiries and emergencies.",
  },
  {
    question: "Do you offer free consultations?",
    answer: "Yes! We offer completely free consultations to discuss your cleaning needs and provide customized quotes.",
  },
  {
    question: "What areas do you service?",
    answer:
      "We primarily serve the Abeokuta region and surrounding areas. Contact us to confirm service availability in your location.",
  },
  {
    question: "How do I schedule a service?",
    answer:
      "Call us at +234-8137-192-766, email info@bitnoxsolution.com, or fill out our contact form. We aim to respond within 2 hours.",
  },
  {
    question: "Are your cleaning products eco-friendly?",
    answer: "We use high-quality, environmentally conscious cleaning products that are safe for your family and pets.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, bank transfers, and online payments. Flexible payment plans are available for regular services.",
  },
]

export default function ContactPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".contact-fade-in").forEach((el: any) => {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
      })

      gsap.utils.toArray(".contact-scale-in").forEach((el: any) => {
        gsap.from(el, {
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="contact">
      {/* Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-pattern"></div>
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Get in Touch</h1>
          <p className="contact-hero-description">
            We'd love to hear from you. Reach out to us via phone, email, or visit us at our office. Our team is ready
            to assist you with any questions.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <div className="contact-info-container">
          <div className="contact-info-card contact-fade-in">
            <div className="contact-info-icon">
              <Phone size={32} />
            </div>
            <h3>Call Us</h3>
            <p className="contact-info-main">+234-8137-192-766</p>
            <p className="contact-info-sub">Hotline 24/7</p>
          </div>

          <div className="contact-info-card contact-fade-in">
            <div className="contact-info-icon">
              <Mail size={32} />
            </div>
            <h3>Email Us</h3>
            <p className="contact-info-main">info@bitnoxsolution.com</p>
            <p className="contact-info-sub">Free consult</p>
          </div>

          <div className="contact-info-card contact-fade-in">
            <div className="contact-info-icon">
              <MapPin size={32} />
            </div>
            <h3>Visit Us</h3>
            <p className="contact-info-main">24, Last Floor Majek Kembo Plaza</p>
            <p className="contact-info-sub">
              Beside Chicken Republic, Lalubu Street
              <br />
              Oke-Ilewo Abeokuta
            </p>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <section className="contact-map-section">
        <div className="contact-map-container contact-scale-in">
          <h2 className="contact-map-title">Find Us On The Map</h2>
          <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.3447662737!2d3.3390846!3d7.1352459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103a4bd512ad0f79%3A0x1750465af8955ca1!2s24%20Majek%20Kembo%20Plaza%2C%20Abeokuta!5e0!3m2!1sen!2sng!4v1730383200000"            width="100%"
            height="500"
            style={{ border: 0, borderRadius: "16px" }}
            // allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="contact-map-iframe"
          ></iframe>
          <p className="contact-map-help">
            Click the map above to get directions via Google Maps or use the coordinates to navigate with your preferred
            navigation app.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="contact-form-container">
          <div className="contact-form-content contact-fade-in">
            <h2>Send Us A Message</h2>
            <p>
              Have a question or ready to book a service? Fill out the form below and we'll get back to you within 2
              hours.
            </p>
            <form className="contact-form">
              <div className="contact-form-group">
                <input type="text" placeholder="Your Full Name" required />
              </div>
              <div className="contact-form-group">
                <input type="email" placeholder="Your Email Address" required />
              </div>
              <div className="contact-form-group">
                <input type="tel" placeholder="Your Phone Number" required />
              </div>
              <div className="contact-form-group">
                <select required>
                  <option value="">Select Service Type</option>
                  <option value="home">Home Cleaning</option>
                  <option value="office">Office Cleaning</option>
                  <option value="post">Post-Construction</option>
                  <option value="laundry">Laundry Service</option>
                  <option value="specialized">Specialized Cleaning</option>
                  <option value="emergency">Emergency Service</option>
                </select>
              </div>
              <div className="contact-form-group">
                <textarea placeholder="Tell us about your cleaning needs..." rows={5}></textarea>
              </div>
              <button type="submit" className="contact-form-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="contact-faqs-section">
        <div className="contact-faqs-container">
          <h2 className="contact-faqs-title contact-fade-in">Frequently Asked Questions</h2>
          <div className="contact-faqs-grid">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="contact-faq-item contact-fade-in"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="contact-faq-header">
                  <h3>{faq.question}</h3>
                  <div className="contact-faq-icon">
                    {expandedIndex === index ? <Minus size={24} /> : <Plus size={24} />}
                  </div>
                </div>
                {expandedIndex === index && (
                  <div className="contact-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
