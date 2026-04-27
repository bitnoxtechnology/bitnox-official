import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { newsletterService } from "@/lib/services/newsletter-service";

const ManageNewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState<INewsletterSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const LIMIT = 20;

  const fetchSubscribers = async () => {
    try {
      const res = await newsletterService.getAllSubscribers({
        page,
        limit: LIMIT,
        active: activeFilter,
        q: search || undefined,
      });
      if (res.success && res.data) {
        setSubscribers(res.data.subscribers);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      toast.error("Failed to fetch subscribers.");
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, activeFilter, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleStatus = async (sub: INewsletterSubscriber) => {
    setTogglingId(sub._id);
    try {
      await newsletterService.updateSubscriberStatus(sub._id, !sub.isActive);
      toast.success(
        sub.isActive ? "Subscriber deactivated." : "Subscriber activated."
      );
      fetchSubscribers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update subscriber status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (sub: INewsletterSubscriber) => {
    if (
      !window.confirm(
        `Permanently delete subscriber "${sub.email}"? This cannot be undone.`
      )
    )
      return;

    setDeletingId(sub._id);
    try {
      await newsletterService.deleteSubscriber(sub._id);
      toast.success("Subscriber deleted successfully.");
      fetchSubscribers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete subscriber.");
    } finally {
      setDeletingId(null);
    }
  };

  const filterBtnClass = (value: boolean | undefined) => {
    const isActive =
      activeFilter === value ||
      (value === undefined && activeFilter === undefined);
    return `px-3! py-1.5! text-sm cursor-pointer rounded-md border transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border hover:bg-accent"
    }`;
  };

  return (
    <div className="min-h-screen container mx-auto pb-10! max-w-5xl">
      <div className="flex items-center justify-between mb-6!">
        <h1 className="text-2xl font-semibold">Newsletter Subscribers</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6!">
        <div className="flex gap-2">
          <button
            className={filterBtnClass(undefined)}
            onClick={() => {
              setActiveFilter(undefined);
              setPage(1);
            }}
          >
            All
          </button>
          <button
            className={filterBtnClass(true)}
            onClick={() => {
              setActiveFilter(true);
              setPage(1);
            }}
          >
            Active
          </button>
          <button
            className={filterBtnClass(false)}
            onClick={() => {
              setActiveFilter(false);
              setPage(1);
            }}
          >
            Inactive
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-3! py-1.5! text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="sm" className="cursor-pointer px-3!">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-primary">
                <th className="text-left px-4! py-3! font-medium text-background">
                  Email
                </th>
                <th className="text-left px-4! py-3! font-medium text-background">
                  Status
                </th>
                <th className="text-left px-4! py-3! font-medium text-background hidden sm:table-cell">
                  Subscribed
                </th>
                <th className="px-4! py-3! font-medium text-background text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4! py-8! text-center text-muted-foreground"
                  >
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4! py-3! font-mono text-xs sm:text-sm truncate max-w-[200px]">
                      {sub.email}
                    </td>
                    <td className="px-4! py-3!">
                      <span
                        className={`inline-flex items-center px-2! py-0.5! rounded-full text-xs font-medium ${
                          sub.isActive
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {sub.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4! py-3! text-muted-foreground hidden sm:table-cell">
                      {new Date(sub.subscribedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4! py-3!">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(sub)}
                          disabled={togglingId === sub._id}
                          className="cursor-pointer text-xs text-foreground p-2!"
                        >
                          {togglingId === sub._id
                            ? "..."
                            : sub.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(sub)}
                          disabled={deletingId === sub._id}
                          className="cursor-pointer text-xs p-2!"
                        >
                          {deletingId === sub._id ? "..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4!">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNewsletterSubscribers;
