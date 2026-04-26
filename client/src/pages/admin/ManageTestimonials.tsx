import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { testimonialService } from "@/lib/services/testimonial-service";

import CreateTestimonialForm from "./components/CreateTestimonialForm";
import UpdateTestimonialForm from "./components/UpdateTestimonialForm";

const ManageTestimonials = () => {
  const [activeTab, setActiveTab] = useState<"create" | "update" | "delete">(
    "create"
  );
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<ITestimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await testimonialService.getAllTestimonials({ limit: 100 });
      if (res.success && res.data?.testimonials) {
        setTestimonials(res.data.testimonials);
      }
    } catch {
      toast.error("Failed to fetch testimonials.");
    }
  };

  const onDelete = async (testimonialId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this testimonial? This cannot be undone."
      )
    ) {
      setIsSubmitting(true);
      try {
        await testimonialService.deleteTestimonial(testimonialId);
        toast.success("Testimonial deleted successfully!");
        fetchTestimonials();
      } catch {
        toast.error("Failed to delete testimonial.");
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

  const renderStars = (rating: number) =>
    "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div className="min-h-screen container mx-auto pb-10! max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6!">Manage Testimonials</h1>

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

      {activeTab === "create" && (
        <CreateTestimonialForm onCreated={fetchTestimonials} />
      )}

      {activeTab === "update" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-3 mt-4! md:mt-6!">
              <p className="text-sm text-muted-foreground">
                {testimonials.length} testimonial(s)
              </p>
              <div className="max-h-[400px] mt-3! overflow-auto border rounded-md divide-y">
                {testimonials.map((item) => (
                  <div
                    key={item._id}
                    className={`p-2! cursor-pointer hover:text-gray-900 hover:bg-accent ${
                      selected?._id === item._id
                        ? "bg-accent text-gray-900"
                        : ""
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    <div className="font-medium">{item.clientName}</div>
                    <p className="text-xs text-muted-foreground">
                      {item.company} · {renderStars(item.rating)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4! text-white">
              Edit Testimonial
            </h2>
            {selected ? (
              <UpdateTestimonialForm
                selected={selected}
                onUpdated={fetchTestimonials}
                onCleared={() => setSelected(null)}
              />
            ) : (
              <div className="text-muted-foreground">
                Select a testimonial to edit
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "delete" && (
        <div className="max-w-3xl mt-4! md:mt-6! space-y-4">
          <p className="text-sm text-muted-foreground">
            {testimonials.length} testimonial(s)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3!">
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="border rounded-md p-3! flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.clientName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {item.clientName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-medium line-clamp-1">
                      {item.clientName}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.company}
                    </p>
                    <p className="text-xs text-yellow-400">
                      {renderStars(item.rating)}
                    </p>
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

export default ManageTestimonials;
