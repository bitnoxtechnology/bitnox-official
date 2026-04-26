import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/LatestBlogs.css";
import { blogService } from "@/lib/services/blog-service";
import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./skeleton/BlogCardSkeleton";

gsap.registerPlugin(ScrollTrigger);

function LatestBlogs() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    blogService
      .getAllBlogs({ page: 1, limit: 3, isPublished: true })
      .then((res) => {
        if (res.success && res.data?.blogs) {
          setBlogs(res.data.blogs);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading || blogs.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      });

      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            opacity: 0,
            y: 60,
            duration: 0.7,
            delay: index * 0.1,
            ease: "power2.out",
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [blogs, isLoading]);

  return (
    <section className="latest-blogs-section" ref={sectionRef}>
      <div className="latest-blogs-container">
        <div className="latest-blogs-header" ref={titleRef}>
          <h2 className="testimonial-title">Latest from Our Blog</h2>
          <p className="latest-blogs-subtitle">
            Insights, tutorials, and updates from the Bitnox team
          </p>
        </div>

        <div className="latest-blogs-grid">
          {isLoading ? (
            <>
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </>
          ) : blogs.length === 0 ? (
            <div className="latest-blogs-empty">No blog posts yet.</div>
          ) : (
            blogs.map((blog, index) => (
              <div
                key={blog._id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
              >
                <BlogCard blog={blog} />
              </div>
            ))
          )}
        </div>

        <div className="latest-blogs-cta">
          <Link to="/blogs" className="latest-blogs-link">
            Explore All Posts <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LatestBlogs;
