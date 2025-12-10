import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "@/styles/Auth.css";
import AboutUs from "@/pages/AboutUs";
import Cleaning from "@/pages/Cleaning";
import Contact from "@/pages/Contact";
import Signup from "./pages/auth/Signup";
import { Toaster } from "sonner";
import Login from "./pages/auth/Login";
import PublicLayout from "./layout/PublicLayout";
import LandingPage from "./pages/LandingPage";
import AuthLayout from "./layout/AuthLayout";
import AuthRoutes from "./protected/AuthRoutes";
import ManageBlog from "./pages/admin/ManageBlog";
import ProtectedRoutes from "./protected/ProtectedRoutes";
import Blogs from "./pages/Blogs"; // Import the Blogs component
import BlogDetail from "./pages/BlogDetail"; // Import the BlogDetail component

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/cleaning" element={<Cleaning />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blogs" element={<Blogs />} /> {/* New Blogs route */}
          <Route path="/blog/:slug" element={<BlogDetail />} />{" "}
          {/* New Blog Detail route */}
        </Route>

        <Route element={<AuthRoutes />}>
          <Route element={<AuthLayout />} path="/auth">
            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/admin/manage-blog" element={<ManageBlog />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
