import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { blogService } from "@/lib/services/blog-service";
import { Spinner } from "@/components/ui/spinner";
import Meta from "@/components/Meta";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import BlogCardSkeleton from "@/components/skeleton/BlogCardSkeleton";

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
      const res = await blogService.getAllBlogs({
        page: currentPage,
        limit: 6,
        isPublished: true,
      });
      if (res.success && res.data?.blogs) {
        setBlogs(res.data.blogs);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      toast.error("Failed to fetch blog posts.");
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
      <div className="container py-12! md:py-16!">
        <h1 className="text-3xl font-bold mb-4! text-primary-500">
          Our Latest Posts
        </h1>
        <p className="text-lg text-gray-400 mb-12! mx-auto">
          Stay updated with the latest in technology, business, and insights
          from Bitnox Technology.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-gray-500 text-lg mb-6!">
            No blog posts published yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-12! space-x-4!">
            <Button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              variant="outline"
              className="px-6! py-2! rounded-md text-black"
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
              className="px-6! py-2! rounded-md text-black"
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
