import './App.css'
import About from './Components/About'
import Conclusion from './Components/Conclusion'
import Herosection from './Components/Herosection'
import Navbar from './Components/Navbar'
import Portfolio from './Components/Portfolio'
import Testimonial from './Components/Testimonial'
import WhyUs from './Components/WhyUs'
// import Footer from './Components/Footer'
function App() {

  return (
    <>
      <div>
<Navbar />
<Herosection />
<About />
<WhyUs/>
<Portfolio />
<Testimonial/>
<Conclusion/>
{/* <Footer /> */}
      </div>
    </>
  )
}

export default App
