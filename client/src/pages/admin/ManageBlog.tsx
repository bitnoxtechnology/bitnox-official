import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { blogService } from "@/lib/services/blog-service";

import CreateBlogForm from "./components/CreateBlogForm";
import UpdateBlogForm from "./components/UpdateBlogForm";
import SearchInput from "./components/SearchInput";

const ManageBlog = () => {
  const [activeTab, setActiveTab] = useState<"create" | "update" | "delete">(
    "create"
  );
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<IBlog | null>(null);
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await blogService.getAllBlogs({ q: query });
        if (res.success && res.data?.blogs) {
          setBlogs(res.data.blogs);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchBlogs = async () => {
    try {
      const res = await blogService.getAllBlogs({});
      if (res.success && res.data?.blogs) {
        setBlogs(res.data.blogs);
      }
    } catch (error) {
      toast.error("Failed to fetch blogs.");
      console.error("Fetch blogs error:", error);
    }
  };

  const fetchBlogBySlug = async (blogSlug: string) => {
    try {
      const res = await blogService.getBlogBySlug(blogSlug);
      if (res.success && res.data) {
        const data = res.data.blog;
        setSelected(data);
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while fetching the blog.");
      console.error("Fetch blog detail error:", err);
    }
  };

  const onDelete = async (blogId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this blog post? This cannot be undone."
      )
    ) {
      setIsSubmitting(true);

      try {
        await blogService.deleteBlog(blogId);
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } catch (error) {
        toast.error("Failed to delete blog.");
        console.error("Delete blog error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen container mx-auto pb-10! max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6!">Manage Blog</h1>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            className={`px-4! py-2! text-sm cursor-pointer ${
              activeTab === "create"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create
          </button>
          <button
            className={`px-4! py-2! text-sm border-l cursor-pointer ${
              activeTab === "update"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground"
            }`}
            onClick={() => setActiveTab("update")}
          >
            Update
          </button>
          <button
            className={`px-4! py-2! text-sm border-l cursor-pointer ${
              activeTab === "delete"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground"
            }`}
            onClick={() => setActiveTab("delete")}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Create Tab */}
      {activeTab === "create" && <CreateBlogForm onCreated={fetchBlogs} />}

      {/* Update Tab */}
      {activeTab === "update" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-3 mt-4! md:mt-6!">
              <SearchInput value={query} onChange={setQuery} />
              <div className="my-0.5! text-sm text-muted-foreground">
                {loadingSearch
                  ? "Searching..."
                  : blogs.length === 0
                  ? "No matches"
                  : `${blogs.length} result(s)`}
              </div>
              <div className="max-h-[400px] mt-3! overflow-auto border rounded-md divide-y">
                {blogs.map((item) => (
                  <div
                    key={item._id}
                    className={`p-2! cursor-pointer hover:text-gray-900 hover:bg-accent ${
                      selected?._id === item._id
                        ? "bg-accent text-gray-900"
                        : ""
                    }`}
                    onClick={() => fetchBlogBySlug(item.slug)}
                  >
                    <div className="font-medium">{item.title}</div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4! text-white">
              Edit Existing Post
            </h2>
            {selected ? (
              <UpdateBlogForm
                selected={selected}
                onUpdated={fetchBlogs}
                onCleared={() => setSelected(null)}
              />
            ) : (
              <div className="text-muted-foreground">Select a post to edit</div>
            )}
          </div>
        </div>
      )}

      {/* Delete Tab */}
      {activeTab === "delete" && (
        <div className="max-w-3xl mt-4! md:mt-6! space-y-4">
          <div className="max-w-sm">
            <SearchInput value={query} onChange={setQuery} />
          </div>
          <div className="my-0.5! text-sm text-muted-foreground">
            {loadingSearch
              ? "Searching..."
              : blogs.length === 0
              ? "No matches"
              : `${blogs.length} result(s)`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3!">
            {blogs.map((item) => (
              <div
                key={item._id}
                className="border rounded-md p-3! flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-medium line-clamp-1">{item.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.excerpt}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(item._id)}
                  className="cursor-pointer p-3!"
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;
