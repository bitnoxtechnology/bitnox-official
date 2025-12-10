import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { User, CalendarDays, Tag } from "lucide-react";

import { blogService } from "@/lib/services/blog-service";
import { Spinner } from "@/components/ui/spinner";
import Meta from "@/components/Meta";
import EditorMDX from "@/components/editor/mdx-editor";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<IBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogDetail(slug);
    }
  }, [slug]);

  const fetchBlogDetail = async (blogSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await blogService.getBlogBySlug(blogSlug);
      if (res.success && res.data) {
        setBlog(res.data.blog);
      } else {
        setError(res.message || "Blog post not found.");
        toast.error(res.message || "Blog post not found.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching the blog.");
      toast.error(err?.message || "An error occurred while fetching the blog.");
      console.error("Fetch blog detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-20">
        <Spinner className="size-12 text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl min-h-screen py-20">
        <p>{error}</p>
        <p className="text-gray-400 text-lg mt-4">
          Please check the URL or try again later.
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center text-gray-400 text-xl min-h-screen py-20">
        <p>Blog post not found.</p>
      </div>
    );
  }

  return (
    <>
      <Meta
        title={`${blog.title} | Bitnox Technology Blog`}
        description={blog.excerpt}
        keywords={blog.tags?.join(", ")}
      />
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto bg-secondary-900 rounded-lg shadow-xl overflow-hidden">
          {blog.coverImage && (
            <div className="relative h-96 w-full overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-extrabold text-white mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
              <div className="flex items-center gap-1">
                <User className="size-4" />
                <span>{blog.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="size-4" />
                <span>
                  {blog.publishedAt
                    ? format(new Date(blog.publishedAt), "PPP")
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-8">
              {/* Render contentHtml using RichTextEditor in read-only mode */}
              {/* <QuillEditor
                value={blog.contentHtml}
                onChange={() => {}}
                // readOnly={true}
              /> */}

              <EditorMDX value={blog.contentHtml} readonly={true} />
            </div>

            {blog.images && blog.images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blog.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${blog.title} image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}

            {blog.videos && blog.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Videos</h2>
                <div className="grid grid-cols-1 gap-4">
                  {blog.videos.map((videoUrl, index) => (
                    <div
                      key={index}
                      className="aspect-video w-full rounded-lg overflow-hidden"
                    >
                      {/* Basic check for YouTube/Vimeo for embedding */}
                      {videoUrl.includes("youtube.com") ||
                      videoUrl.includes("youtu.be") ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            videoUrl.split("v=")[1]?.split("&")[0] ||
                            videoUrl.split("/").pop()
                          }`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      ) : videoUrl.includes("vimeo.com") ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${videoUrl
                            .split("/")
                            .pop()}`}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      ) : (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 underline"
                        >
                          Watch Video {index + 1}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center mt-8 pt-6 border-t border-secondary-800">
                <Tag className="size-5 text-gray-500" />
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary-700 text-primary-200 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogDetail;
