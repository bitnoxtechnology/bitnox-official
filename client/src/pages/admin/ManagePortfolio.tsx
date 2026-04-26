import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { portfolioService } from "@/lib/services/portfolio-service";

import CreatePortfolioForm from "./components/CreatePortfolioForm";
import UpdatePortfolioForm from "./components/UpdatePortfolioForm";
import SearchInput from "./components/SearchInput";

const ManagePortfolio = () => {
  const [activeTab, setActiveTab] = useState<"create" | "update" | "delete">(
    "create"
  );
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<IProject | null>(null);
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await portfolioService.getAllProjects({ q: query });
        if (res.success && res.data?.projects) {
          setProjects(res.data.projects);
        }
      } catch {
        // ignore
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchProjects = async () => {
    try {
      const res = await portfolioService.getAllProjects({});
      if (res.success && res.data?.projects) {
        setProjects(res.data.projects);
      }
    } catch {
      toast.error("Failed to fetch projects.");
    }
  };

  const onDelete = async (projectId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This cannot be undone."
      )
    ) {
      setIsSubmitting(true);
      try {
        await portfolioService.deleteProject(projectId);
        toast.success("Project deleted successfully!");
        fetchProjects();
      } catch {
        toast.error("Failed to delete project.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const tabBtnClass = (tab: string) =>
    `px-4! py-2! text-sm cursor-pointer ${
      activeTab === tab
        ? "bg-primary text-primary-foreground"
        : "bg-background text-foreground"
    }`;

  return (
    <div className="min-h-screen container mx-auto pb-10! max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6!">Manage Portfolio</h1>

      <div className="mb-6">
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            className={tabBtnClass("create")}
            onClick={() => setActiveTab("create")}
          >
            Create
          </button>
          <button
            className={`${tabBtnClass("update")} border-l`}
            onClick={() => setActiveTab("update")}
          >
            Update
          </button>
          <button
            className={`${tabBtnClass("delete")} border-l`}
            onClick={() => setActiveTab("delete")}
          >
            Delete
          </button>
        </div>
      </div>

      {activeTab === "create" && <CreatePortfolioForm onCreated={fetchProjects} />}

      {activeTab === "update" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-3 mt-4! md:mt-6!">
              <SearchInput value={query} onChange={setQuery} />
              <div className="my-0.5! text-sm text-muted-foreground">
                {loadingSearch
                  ? "Searching..."
                  : projects.length === 0
                    ? "No matches"
                    : `${projects.length} result(s)`}
              </div>
              <div className="max-h-[400px] mt-3! overflow-auto border rounded-md divide-y">
                {projects.map((item) => (
                  <div
                    key={item._id}
                    className={`p-2! cursor-pointer hover:text-gray-900 hover:bg-accent ${
                      selected?._id === item._id ? "bg-accent text-gray-900" : ""
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    <div className="font-medium">{item.title}</div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4! text-white">
              Edit Project
            </h2>
            {selected ? (
              <UpdatePortfolioForm
                selected={selected}
                onUpdated={fetchProjects}
                onCleared={() => setSelected(null)}
              />
            ) : (
              <div className="text-muted-foreground">
                Select a project to edit
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "delete" && (
        <div className="max-w-3xl mt-4! md:mt-6! space-y-4">
          <div className="max-w-sm">
            <SearchInput value={query} onChange={setQuery} />
          </div>
          <div className="my-0.5! text-sm text-muted-foreground">
            {loadingSearch
              ? "Searching..."
              : projects.length === 0
                ? "No matches"
                : `${projects.length} result(s)`}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3!">
            {projects.map((item) => (
              <div
                key={item._id}
                className="border rounded-md p-3! flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium line-clamp-1">{item.title}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-muted px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(item._id)}
                  className="cursor-pointer p-3! flex-shrink-0"
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

export default ManagePortfolio;
