import React from "react";
import About from "@/components/About";
import Conclusion from "@/components/Conclusion";
import Herosection from "@/components/Herosection";
import Meta from "@/components/Meta";
import Portfolio from "@/components/Portfolio";
import Testimonial from "@/components/Testimonial";
import WhyUs from "@/components/WhyUs";

const LandingPage = () => {
  return (
    <>
      <Meta />
      <Herosection />
      <About />
      <WhyUs />
      <Portfolio />
      <Testimonial />
      <Conclusion />
    </>
  );
};

export default LandingPage;
