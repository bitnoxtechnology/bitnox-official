// "use client"

// import { useEffect, useRef } from "react"
// import { gsap } from "gsap"

// function Cleaning() {
//   const containerRef = useRef<HTMLDivElement>(null)
//   const titleRef = useRef<HTMLHeadingElement>(null)

//   useEffect(() => {
//     if (!containerRef.current) return

//     const ctx = gsap.context(() => {
//       if (titleRef.current) {
//         gsap.from(titleRef.current, {
//           opacity: 0,
//           y: 50,
//           duration: 1,
//           ease: "power3.out",
//         })
//       }
//     }, containerRef)

//     return () => ctx.revert()
//   }, [])

//   return (
//     <div ref={containerRef} className="cleaning-page" style={{ minHeight: "100vh", padding: "60px 20px" }}>
//       <h1 ref={titleRef} style={{ textAlign: "center", marginBottom: "30px" }}>
//         Cleaning Services
//       </h1>
//       <p style={{ textAlign: "center", fontSize: "18px" }}>Professional cleaning solutions for your needs.</p>
//     </div>
//   )
// }

// export default Cleaning
