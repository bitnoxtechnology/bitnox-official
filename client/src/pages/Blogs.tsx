import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye } from "lucide-react";

import { blogService } from "@/lib/services/blog-service";
import { Spinner } from "@/components/ui/spinner";
import Meta from "@/components/Meta";

const Blogs = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const fetchBlogs = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await blogService.getAllBlogs(currentPage, 9, true); // Fetch 9 published blogs per page
      if (res.success && res.data?.blogs) {
        setBlogs(res.data.blogs);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error("Failed to fetch blog posts.");
      console.error("Fetch blogs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <Meta title="Our Blog Posts | Bitnox Technology" />
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-primary-500">
          Our Latest Blog Posts
        </h1>
        <p className="text-xl text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Stay updated with the latest in technology, business, and insights
          from Bitnox Technology.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="size-10" />
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No blog posts published yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                to={`/blog/${blog.slug}`}
                key={blog._id}
                className="group block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-secondary-900 border border-secondary-800 hover:border-primary-500"
              >
                {blog.coverImage && (
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">
                    {blog.title}
                  </h2>
                  <p className="text-gray-400 text-base line-clamp-3 mb-4">
                    {blog.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary-700 text-primary-200 text-xs px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      By {blog.author.name} on{" "}
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <Eye className="size-4 text-gray-500 group-hover:text-primary-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-12 space-x-4">
            <Button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              variant="outline"
              className="px-6 py-2 rounded-md"
            >
              Previous
            </Button>
            <span className="text-white text-lg flex items-center">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={page === totalPages || loading}
              variant="outline"
              className="px-6 py-2 rounded-md"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Blogs;
