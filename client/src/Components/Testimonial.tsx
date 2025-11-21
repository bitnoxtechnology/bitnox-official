"use client";

import { Quote } from "lucide-react";
import "../styles/Testimonial.css";
import { testimonials } from "../lib/data";

function Testimonial() {
  // Duplicate testimonials for infinite loop effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="testimonial-section">
      <div className="testimonial-wrapper">
        <div className="testimonial-intro">
          <h2 className="testimonial-title">What Our Clients Say</h2>
          <p className="testimonial-subtitle">
            We love our clients and our clients love to work with us
          </p>
        </div>

        <div className="testimonial-scroll-container">
          <div className="testimonial-track">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="testimonial-card"
              >
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
                  {/* <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  /> */}
                  <div className="testimonial-placeholder-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="testimonial-author-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-position">
                      {testimonial.position}
                    </p>
                    <p className="testimonial-company">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonial;
