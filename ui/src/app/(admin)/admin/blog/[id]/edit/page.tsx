"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/lib/api/blog.api";
import BlogForm from "../../components/blog-form";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();

  // Fetch blog details
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', params.id],
    queryFn: () => blogApi.getById(params.id),
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">
          Failed to load blog post. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return <BlogForm blog={blog} />;
}