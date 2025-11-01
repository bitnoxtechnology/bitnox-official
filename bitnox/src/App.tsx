import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"
import Navbar from "./Components/Navbar"
import Herosection from "./Components/Herosection"
import About from "./Components/About"
import WhyUs from "./Components/WhyUs"
import Portfolio from "./Components/Portfolio"
import Testimonial from "./Components/Testimonial"
import Conclusion from "./Components/Conclusion"
import Footer from "./Components/Footer"
import AboutUs from "./Pages/AboutUs"
import Cleaning from "./Pages/Cleaning"
import Contact from "./Pages/Contact"

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
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
  )
}

export default App
