import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  Briefcase,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { blogService } from "@/lib/services/blog-service";
import { portfolioService } from "@/lib/services/portfolio-service";
import { testimonialService } from "@/lib/services/testimonial-service";
import "@/styles/Dashboard.css";

interface Stats {
  totalBlogs: number;
  publishedBlogs: number;
  totalProjects: number;
  totalTestimonials: number;
}

const StatCard = ({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-label">{label}</span>
      <span className="stat-card-icon">{icon}</span>
    </div>
    {isLoading ? (
      <Spinner className="size-6 text-[#05e4fc]" />
    ) : (
      <div className="stat-value">{value}</div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalProjects: 0,
    totalTestimonials: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      blogService.getAllBlogs({ limit: 5 }),
      blogService.getAllBlogs({ isPublished: true, limit: 1 }),
      portfolioService.getAllProjects({ limit: 1 }),
      testimonialService.getAllTestimonials({ limit: 1 }),
    ])
      .then(([blogsRes, publishedRes, projectsRes, testimonialsRes]) => {
        setStats({
          totalBlogs: blogsRes.data?.total ?? 0,
          publishedBlogs: publishedRes.data?.total ?? 0,
          totalProjects: projectsRes.data?.total ?? 0,
          totalTestimonials: testimonialsRes.data?.total ?? 0,
        });
        setRecentBlogs(blogsRes.data?.blogs ?? []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">
        Overview of your website content and activity
      </p>

      <div className="dashboard-stats-grid">
        <StatCard
          label="Total Blogs"
          value={stats.totalBlogs}
          icon={<FileText size={20} />}
          isLoading={isLoading}
        />
        <StatCard
          label="Published Blogs"
          value={stats.publishedBlogs}
          icon={<CheckCircle size={20} />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Projects"
          value={stats.totalProjects}
          icon={<Briefcase size={20} />}
          isLoading={isLoading}
        />
        <StatCard
          label="Testimonials"
          value={stats.totalTestimonials}
          icon={<MessageSquare size={20} />}
          isLoading={isLoading}
        />
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Recent Blog Posts</h2>
          {isLoading ? (
            <div className="dashboard-loading">
              <Spinner className="size-8 text-[#05e4fc]" />
            </div>
          ) : recentBlogs.length === 0 ? (
            <p className="text-sm text-[#94a3b8]">No blog posts yet.</p>
          ) : (
            recentBlogs.map((blog) => (
              <div key={blog._id} className="dashboard-blog-row">
                <span className="dashboard-blog-title">{blog.title}</span>
                <span
                  className={`dashboard-blog-badge ${blog.isPublished ? "published" : "draft"}`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Quick Actions</h2>
          <div className="dashboard-quick-actions">
            <Link to="/admin/manage-blog" className="quick-action-link">
              <PlusCircle size={16} />
              Create Blog Post
            </Link>
            <Link to="/admin/manage-portfolio" className="quick-action-link">
              <PlusCircle size={16} />
              Add Project
            </Link>
            <Link to="/admin/manage-testimonials" className="quick-action-link">
              <PlusCircle size={16} />
              Add Testimonial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
