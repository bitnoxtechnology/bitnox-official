"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import "../styles/Testimonial.css";
import { testimonialService } from "@/lib/services/testimonial-service";
import TestimonialSkeleton from "./skeleton/TestimonialSkeleton";

function Testimonial() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    testimonialService
      .getAllTestimonials({ limit: 50 })
      .then((res) => {
        if (res.success && res.data?.testimonials) {
          setTestimonials(res.data.testimonials);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
          {isLoading ? (
            <div className="flex gap-10 px-10">
              <TestimonialSkeleton />
              <TestimonialSkeleton />
              <TestimonialSkeleton />
            </div>
          ) : testimonials.length === 0 ? null : (
            <div className="testimonial-track">
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial._id}-${index}`}
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

                  <p className="testimonial-text">{testimonial.testimonialText}</p>

                  <div className="testimonial-author">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.clientName}
                        className="testimonial-avatar"
                      />
                    ) : (
                      <div className="testimonial-placeholder-avatar">
                        {testimonial.clientName.charAt(0)}
                      </div>
                    )}
                    <div className="testimonial-author-info">
                      <h4 className="testimonial-name">
                        {testimonial.clientName}
                      </h4>
                      <p className="testimonial-position">
                        {testimonial.position}
                      </p>
                      <p className="testimonial-company">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Testimonial;
