"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { subjectApi, Subject } from "@/lib/api/subject.api";
import SubjectForm from "./components/subject-form";
import DeleteConfirmDialog from "./components/delete-confirm-dialog";
import ApiStatus, { SubjectsListSkeleton } from "./components/api-status";
import { HierarchicalSubjectList } from "./components/hierarchical-subject-list";

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch hierarchical subjects
  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects', 'hierarchical'],
    queryFn: () => subjectApi.getHierarchical(),
  });

  // Count total subjects recursively
  const countSubjects = (subjects: Subject[]): number => {
    let count = subjects.length;
    subjects.forEach(subject => {
      if (subject.subSubjects && subject.subSubjects.length > 0) {
        count += countSubjects(subject.subSubjects);
      }
    });
    return count;
  };

  const totalSubjects = countSubjects(subjects);

  // Toggle subject status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      subjectApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', 'hierarchical'] });
      toast.success('Subject status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject status');
    },
  });

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', 'hierarchical'] });
      toast.success('Subject deleted successfully');
      setDeletingSubject(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subject');
    },
  });

  // Count active subjects recursively
  const countActiveSubjects = (subjects: Subject[]): number => {
    let activeCount = 0;
    subjects.forEach(subject => {
      if (subject.isActive) activeCount++;
      if (subject.subSubjects && subject.subSubjects.length > 0) {
        activeCount += countActiveSubjects(subject.subSubjects);
      }
    });
    return activeCount;
  };

  const totalActiveSubjects = countActiveSubjects(subjects);

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    setDeletingSubject(subject);
  };

  const handleToggleStatus = (subject: Subject) => {
    toggleStatusMutation.mutate({
      id: subject.id.toString(),
      isActive: !subject.isActive
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingSubject) {
      deleteMutation.mutate(deletingSubject.id.toString());
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-600 mt-1">
              Manage subjects and their AI prompts
            </p>
          </div>
        </div>
        
        <ApiStatus 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-1">
            Manage subjects and their AI prompts
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{totalSubjects}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Main Subjects</p>
                <p className="text-2xl font-bold text-green-900">
                  {subjects.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sub Subjects</p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalSubjects - subjects.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <EyeOff className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subjects</p>
                <p className="text-2xl font-bold text-purple-900">
                  {totalActiveSubjects}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle>All Subjects ({totalSubjects})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <SubjectsListSkeleton />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No subjects available.</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Subject
              </Button>
            </div>
          ) : (
            <HierarchicalSubjectList
              subjects={subjects}
              searchQuery={searchQuery}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isToggling={toggleStatusMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </DialogTitle>
            <DialogDescription>
              {editingSubject 
                ? 'Update the subject information below.' 
                : 'Create a new subject for the platform.'
              }
            </DialogDescription>
          </DialogHeader>
          <SubjectForm
            subject={editingSubject}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingSubject}
        subjectName={deletingSubject?.name || ''}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSubject(null)}
      />
    </div>
  );
}