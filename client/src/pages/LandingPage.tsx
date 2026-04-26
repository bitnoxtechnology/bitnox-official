import React from "react";
import About from "@/components/About";
import Conclusion from "@/components/Conclusion";
import Herosection from "@/components/Herosection";
import LatestBlogs from "@/components/LatestBlogs";
import Meta from "@/components/Meta";
import Portfolio from "@/components/Portfolio";
import Testimonial from "@/components/Testimonial";
import WhyUs from "@/components/WhyUs";

const LandingPage = () => {
  return (
    <>
      <Meta
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Bitnox Technology Solutions",
          url: "https://bitnoxsolution.com",
          logo: "https://bitnoxsolution.com/og-image.png",
          description:
            "Comprehensive IT solutions — web development, cloud infrastructure, cybersecurity, digital marketing, and tech training.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Abeokuta",
            addressCountry: "NG",
          },
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: "info@bitnoxsolution.com",
          },
        }}
      />
      <Herosection />
      <About />
      <WhyUs />
      <Portfolio />
      <Testimonial />
      <LatestBlogs />
      <Conclusion />
    </>
  );
};

export default LandingPage;
