import React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import blog_cover_image from "@/assets/blog-cover-image.png";

interface BlogCardProps {
  blog: IBlog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      key={blog._id}
      className="group block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-secondary-900 border border-gray-700 hover:border-primary-200"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={blog.coverImage ? blog.coverImage : blog_cover_image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* <div className="absolute z-10 inset-0 bg-linear-70 from-black/70 via-transparent to-transparent"></div> */}
      </div>

      <div className="py-5! px-3!">
        <h2 className="text-2xl font-bold text-white mb-2! group-hover:text-primary-300 transition-colors duration-300">
          {blog.title}
        </h2>
        <p className="text-gray-400 text-base line-clamp-3 mb-4!">
          {blog.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 mb-4!">
          {blog.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-primary text-primary-200 text-xs px-3! py-1! rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            By <span className="capitalize">{blog.author.name}</span> on{" "}
            {blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString()
              : "N/A"}
          </span>
          <Eye className="size-4 text-gray-500 group-hover:text-primary-500" />
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
