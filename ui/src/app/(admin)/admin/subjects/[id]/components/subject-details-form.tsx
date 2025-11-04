"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Subject } from "@/lib/api/subject.api";

const formSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(255, "Name too long"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface SubjectDetailsFormProps {
  subject: Subject;
  isEditing: boolean;
  onSave: (data: Partial<Subject>) => void;
  isLoading: boolean;
}

export default function SubjectDetailsForm({
  subject,
  isEditing,
  onSave,
  isLoading,
}: SubjectDetailsFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject.name,
      slug: subject.slug,
      description: subject.description || "",
      isActive: subject.isActive,
    },
  });

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = (data: FormData) => {
    onSave({
      name: data.name,
      slug: data.slug,
      description: data.description,
      isActive: data.isActive,
    });
    setHasUnsavedChanges(false);
  };

  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
              {subject.name}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-md font-mono text-sm">
              {subject.slug}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[100px]">
            {subject.description || "No description provided"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            subject.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {subject.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Mathematics, Physics"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug *</FormLabel>
                <FormControl>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="e.g., mathematics, physics-101"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleFieldChange();
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const name = form.getValues('name');
                        if (name) {
                          form.setValue('slug', generateSlug(name));
                          handleFieldChange();
                        }
                      }}
                      className="shrink-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the subject..."
                  className="min-h-[120px]"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-gray-500">
                  Make this subject available to users
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked: boolean) => {
                    field.onChange(checked);
                    handleFieldChange();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {hasUnsavedChanges && (
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You have unsaved changes
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
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}