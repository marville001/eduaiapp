"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Subject } from "@/lib/api/subject.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoTags: z.array(z.string()).optional(),
  seoImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SubjectSEOFormProps {
  subject: Subject;
  isEditing: boolean;
  onSave: (data: Partial<Subject>) => void;
  isLoading: boolean;
}

export default function SubjectSEOForm({
  subject,
  isEditing,
  onSave,
  isLoading,
}: SubjectSEOFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newTag, setNewTag] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seoTitle: subject.seoTitle || "",
      seoDescription: subject.seoDescription || "",
      seoTags: subject.seoTags || [],
      seoImage: subject.seoImage || "",
      canonicalUrl: subject.canonicalUrl || "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSave({
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      seoTags: data.seoTags,
      seoImage: data.seoImage,
      canonicalUrl: data.canonicalUrl,
    });
    setHasUnsavedChanges(false);
  };

  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('seoTags') || [];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('seoTags', [...currentTags, newTag.trim()]);
        setNewTag("");
        handleFieldChange();
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('seoTags') || [];
    form.setValue('seoTags', currentTags.filter(tag => tag !== tagToRemove));
    handleFieldChange();
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
              {subject.seoTitle || `${subject.name} - Default Title`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Image URL
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
              {subject.seoImage || "No image set"}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canonical URL
          </label>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
            {subject.canonicalUrl || "No canonical URL set"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO Description
          </label>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-20">
            {subject.seoDescription || "No SEO description provided"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {subject.seoTags && subject.seoTags.length > 0 ? (
              subject.seoTags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No SEO tags defined</p>
            )}
          </div>
        </div>

        {/* SEO Preview */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Search Preview</h3>
          <div className="bg-white p-4 rounded border">
            <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
              {subject.seoTitle || `${subject.name} - AI Education Platform`}
            </h4>
            <p className="text-green-600 text-sm">
              educationplatform.com/subjects/{subject.slug}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {subject.seoDescription || `Learn ${subject.name} with AI-powered tutoring. Get instant help with homework and improve your understanding.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Mathematics Tutoring - AI Education"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Recommended: 50-60 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seoImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Image for social media sharing (1200×630px recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="canonicalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canonical URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/original-page"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange();
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The preferred URL for this content if it exists on multiple URLs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description for search engines..."
                    className="min-h-[100px]"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange();
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Recommended: 150-160 characters. This appears in search results.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SEO Tags */}
          <div className="space-y-4">
            <FormLabel>SEO Tags</FormLabel>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-2">
              {(form.getValues('seoTags') || []).map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add New Tag */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Tags help with categorization and search optimization
            </p>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You have unsaved SEO changes
              </p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.reset();
                    setHasUnsavedChanges(false);
                  }}
                >
                  Discard
                </Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save SEO Settings"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>

      {/* SEO Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          Search Preview
        </h3>
        <div className="bg-white p-4 rounded border">
          <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
            {form.getValues('seoTitle') || `${subject.name} - AI Education Platform`}
          </h4>
          <p className="text-green-600 text-sm">
            educationplatform.com/subjects/{subject.slug}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {form.getValues('seoDescription') || `Learn ${subject.name} with AI-powered tutoring.`}
          </p>
        </div>
      </div>
    </div>
  );
}