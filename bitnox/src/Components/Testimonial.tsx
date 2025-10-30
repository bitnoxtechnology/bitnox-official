"use client"

import { Quote } from "lucide-react"
import "../styles/testimonial.css"

function Testimonial() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "CEO, TechFlow Inc",
      company: "TechFlow",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      text: "Bitnox Solution has been instrumental in transforming our online presence. Their team developed a dynamic website and web application that perfectly showcases our services and improves user experience. We highly recommend Bitnox Solution for their expertise in web development!",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Founder, StartupHub",
      company: "StartupHub",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      text: "Bitnox Solution stands out with their exceptional website development services. Their expert team combines technical prowess, creative design, and strategic thinking to create impactful online experiences. With their dedication to excellence and commitment to client success!",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Marketing Director, PrompPay",
      company: "PrompPay",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      text: "Their team's ability to understand unique requirements and deliver tailored solutions is truly commendable. With their top-notch web development services, Bitnox Solution is dedicated to helping businesses thrive in the digital landscape!",
      rating: 5,
    },
    {
      id: 4,
      name: "David Thompson",
      position: "CTO, InnovateLabs",
      company: "InnovateLabs",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      text: "Working with Bitnox was a game-changer for our business. They delivered a sophisticated platform that exceeded our expectations. Their attention to detail and technical expertise is unmatched in the industry.",
      rating: 5,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      position: "Operations Manager, Global Ventures",
      company: "Global Ventures",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
      text: "The professionalism and dedication shown by the Bitnox team throughout our project was outstanding. They not only met our tight deadlines but also provided innovative solutions we hadn't even considered.",
      rating: 5,
    },
  ]

  // Duplicate testimonials for infinite loop effect
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="testimonial-section">
      <div className="testimonial-wrapper">
        <div className="testimonial-intro">
          <h2 className="testimonial-title">What Our Clients Say</h2>
          <p className="testimonial-subtitle">We love our clients and our clients love to work with us</p>
        </div>

        <div className="testimonial-scroll-container">
          <div className="testimonial-track">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="testimonial-card">
                <div className="testimonial-quote-icon">
                  <Quote size={40} />
                </div>

                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">
                      ★
                    </span>
                  ))}
                </div>

                <p className="testimonial-text">{testimonial.text}</p>

                <div className="testimonial-author">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-position">{testimonial.position}</p>
                    <p className="testimonial-company">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonial