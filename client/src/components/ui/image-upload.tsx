import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Image, X } from "lucide-react";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { Spinner } from "./spinner";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove: (url: string) => void;
  initialImages?: string[];
  maxFiles?: number;
  label?: string;
  multiple?: boolean;
}

export function ImageUpload({
  onUpload,
  onRemove,
  initialImages = [],
  maxFiles = 1,
  label = "Upload Image",
  multiple = false,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxFiles) {
        toast.error(`You can only upload a maximum of ${maxFiles} files.`);
        return;
      }

      setLoading(true);
      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const result = await uploadToCloudinary(file);
          return result.url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...uploadedUrls]);
        uploadedUrls.forEach((url) => onUpload(url));
        toast.success("Image(s) uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload image(s). Please try again.");
        console.error("Upload error:", error);
      } finally {
        setLoading(false);
      }
    },
    [images, maxFiles, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".webp", ".gif", ".svg"],
    },
    multiple,
  });

  const handleRemoveImage = (urlToRemove: string) => {
    setImages((prev) => prev.filter((url) => url !== urlToRemove));
    onRemove(urlToRemove);
    toast.info("Image removed.");
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div
        {...getRootProps()}
        className="flex cursor-pointer items-center justify-center rounded-lg border border-secondary-500! text-tertiary-400! p-6! transition-colors"
      >
        <input {...getInputProps()} disabled={loading} />
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Uploading...</span>
          </div>
        ) : isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Image className="size-8 text-gray-400" />
            <p className="text-sm">
              Drag 'n' drop some files here, or click to select files
            </p>
            {maxFiles > 1 && (
              <p className="text-xs text-gray-400">(Up to {maxFiles} files)</p>
            )}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((url) => (
            <div key={url} className="relative aspect-video rounded-md">
              <img
                src={url}
                alt="Uploaded preview"
                className="h-full w-full rounded-md object-cover"
              />
              <button
                title="remove"
                type="button"
                onClick={() => handleRemoveImage(url)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-80 hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
