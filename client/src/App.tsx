import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Herosection from "./components/Herosection";
import About from "./components/About";
import WhyUs from "./components/WhyUs";
import Portfolio from "./components/Portfolio";
import Testimonial from "./components/Testimonial";
import Conclusion from "./components/Conclusion";
import Footer from "./components/Footer";
import AboutUs from "./pages/AboutUs";
import Cleaning from "./pages/Cleaning";
import Contact from "./pages/Contact";
import Meta from "./components/Meta";
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" richColors closeButton />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Meta />
              <Herosection />
              <About />
              <WhyUs />
              <Portfolio />
              <Testimonial />
              <Conclusion />
            </>
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
