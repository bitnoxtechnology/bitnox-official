import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../Styles/Navbar.css";
import SecondaryLogo from "../assets/Logo.svg";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLElement | null)[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initial animation on mount
    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.from(logoRef.current, {
          opacity: 0,
          x: -50,
          duration: 1,
          ease: "power3.out",
        });
      }

      const validItems = menuItemsRef.current.filter((item) => item !== null);
      if (validItems.length > 0) {
        gsap.from(validItems, {
          opacity: 0,
          y: -30,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.3,
        });
      }
    }, navRef);

    // Scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Mobile menu animation
    if (mobileMenuRef.current) {
      if (isOpen) {
        gsap.to(mobileMenuRef.current, {
          x: 0,
          duration: 0.5,
          ease: "power3.inOut",
        });

        const mobileItems = mobileMenuRef.current.querySelectorAll(".mobile-nav-item");
        gsap.from(mobileItems, {
          opacity: 0,
          x: -30,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.2,
          ease: "power2.out",
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          x: "-100%",
          duration: 0.5,
          ease: "power3.inOut",
        });
      }
    }

    // Hamburger animation
    if (hamburgerRef.current) {
      const lines = hamburgerRef.current.querySelectorAll(".hamburger-line");
      if (isOpen) {
        gsap.to(lines[0], { rotation: 45, y: 8, duration: 0.3 });
        gsap.to(lines[1], { opacity: 0, duration: 0.2 });
        gsap.to(lines[2], { rotation: -45, y: -8, duration: 0.3 });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(lines[1], { opacity: 1, duration: 0.2 });
        gsap.to(lines[2], { rotation: 0, y: 0, duration: 0.3 });
      }
    }
  }, [isOpen]);

  const navItems = [
    { name: "About", href: "/about" },
    { name: "Blogs", href: "#blog" },
    { name: "Tech Training", href: "https://edu.bitnoxsolution.com/" },
    { name: "Ask Community", href: "https://askcom.bitnoxsolution.com/" },
    { name: "Cleaning", href: "#cleaning" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
      >
        <div className="navbar-container">
          {/* Logo */}
          <div ref={logoRef} className="navbar-logo">
          <img src={SecondaryLogo} alt="" />
          </div>

          {/* Desktop Menu */}
          <ul className="navbar-menu">
            {navItems.map((item, index) => (
              <li
                key={item.name}
                ref={(el) => {
                  menuItemsRef.current[index] = el;
                }}
                className="navbar-menu-item"
              >
                <a href={item.href} className="navbar-link">
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Button */}
          <div
            ref={(el) => {
              menuItemsRef.current[navItems.length] = el;
            }}
            className="navbar-cta"
          >
            <button className="cta-button">Get Started</button>
          </div>

          {/* Hamburger Menu */}
          <button
            ref={hamburgerRef}
            className="hamburger"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div ref={mobileMenuRef} className="mobile-menu">
        <ul className="mobile-menu-list">
          {navItems.map((item) => (
            <li key={item.name} className="mobile-nav-item">
              <a
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            </li>
          ))}
          <li className="mobile-nav-item">
            <button className="mobile-cta-button">Get Started</button>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Navbar;