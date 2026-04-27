import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/assets/Logo.svg";
import "@/styles/AdminLayout.css";

const baseNavLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/manage-blog", label: "Manage Blog", icon: FileText },
  { to: "/admin/manage-portfolio", label: "Manage Portfolio", icon: Briefcase },
  {
    to: "/admin/manage-testimonials",
    label: "Manage Testimonials",
    icon: MessageSquare,
  },
];

const superAdminLinks = [
  { to: "/admin/manage-users", label: "Manage Users", icon: Users },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navLinks =
    user?.role === "super_admin"
      ? [...baseNavLinks, ...superAdminLinks]
      : baseNavLinks;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <div
        className={`admin-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-logo">
          <img src={Logo} alt="Bitnox" />
          <div className="admin-sidebar-logo-text">Admin Panel</div>
        </div>

        <nav className="admin-sidebar-nav">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className="admin-user-email">{user?.email}</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-content">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <button
            className="admin-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="admin-mobile-header-title">Bitnox Admin</span>
          {sidebarOpen && (
            <button className="admin-mobile-menu-btn" onClick={closeSidebar}>
              <X size={22} />
            </button>
          )}
        </div>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
