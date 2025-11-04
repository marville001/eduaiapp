"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll(),
  });

  // Toggle subject status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      subjectApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
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
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
      setDeletingSubject(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subject');
    },
  });

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Subjects</p>
                <p className="text-2xl font-bold text-green-900">
                  {subjects.filter(s => s.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Inactive Subjects</p>
                <p className="text-2xl font-bold text-red-900">
                  {subjects.filter(s => !s.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <EyeOff className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-900">
                  {subjects.filter(s => {
                    const createdAt = new Date(s.createdAt);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && 
                           createdAt.getFullYear() === now.getFullYear();
                  }).length}
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
          <CardTitle>All Subjects ({filteredSubjects.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <SubjectsListSkeleton />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No subjects found matching your search.' : 'No subjects available.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Subject
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <div key={subject.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {subject.name}
                        </h3>
                        <Badge
                          variant={subject.isActive ? "default" : "secondary"}
                          className={subject.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {subject.description && (
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {subject.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        <span>Slug: {subject.slug}</span>
                        <span>Created: {new Date(subject.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(subject)}
                        disabled={toggleStatusMutation.isPending}
                        className="text-xs"
                      >
                        {subject.isActive ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/subjects/${subject.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(subject)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Quick Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(subject)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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