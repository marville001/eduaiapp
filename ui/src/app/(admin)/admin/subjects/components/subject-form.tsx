"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { subjectApi, Subject, CreateSubjectDto, UpdateSubjectDto } from "@/lib/api/subject.api";

const formSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(255, "Name too long"),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentSubjectId: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SubjectFormProps {
  subject?: Subject | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubjectForm({ subject, onSuccess, onCancel }: SubjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const queryClient = useQueryClient();

  // Get all main subjects for parent selection
  const { data: mainSubjects = [] } = useQuery({
    queryKey: ['subjects', 'main'],
    queryFn: () => subjectApi.getAll(0), // Get only main subjects (parentId = 0)
  });

  // Function to generate slug from name
  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject?.name || "",
      slug: subject?.slug || "",
      description: subject?.description || "",
      parentSubjectId: subject?.parentSubjectId || undefined,
    },
  });

  // Auto-generate slug when name changes (only if slug is empty or not manually edited)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name && !isSlugManual && !value.slug) {
        form.setValue('slug', generateSlug(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isSlugManual, generateSlug]);

  // Check if editing an existing subject with a slug (assume it was manually set)
  useEffect(() => {
    if (subject?.slug) {
      setIsSlugManual(true);
    }
  }, [subject]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSubjectDto) => subjectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create subject');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectDto }) =>
      subjectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject');
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (subject) {
        // Update existing subject
        await updateMutation.mutateAsync({
          id: subject.id.toString(),
          data: {
            name: data.name,
            slug: data.slug || generateSlug(data.name),
            description: data.description,
            parentSubjectId: data.parentSubjectId,
          },
        });
      } else {
        // Create new subject
        await createMutation.mutateAsync({
          name: data.name,
          slug: data.slug || generateSlug(data.name),
          description: data.description || undefined,
          parentSubjectId: data.parentSubjectId,
        });
      }
    } catch {
      // Error is handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // Auto-generate slug if not manually set
                    if (!isSlugManual && e.target.value) {
                      form.setValue('slug', generateSlug(e.target.value));
                    }
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
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., mathematics, physics-101"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setIsSlugManual(true);
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
                        setIsSlugManual(false);
                      }
                    }}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              {/* <p className="text-xs text-gray-500 mt-1">
                Leave empty to auto-generate from subject name
              </p> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentSubjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Subject</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select parent subject (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Main Subject)</SelectItem>
                  {mainSubjects
                    .filter(s =>  s.id !== subject?.id && !s.parentSubjectId) // Don't allow self-selection
                    .map((mainSubject) => (
                      <SelectItem key={mainSubject.id} value={mainSubject.id.toString()}>
                        {mainSubject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the subject (optional)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            {isSubmitting 
              ? (subject ? 'Updating...' : 'Creating...') 
              : (subject ? 'Update Subject' : 'Create Subject')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}