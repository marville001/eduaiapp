"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, EyeOff, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { pageApi, Page } from "@/lib/api/page.api";
import Link from "next/link";

export default function PagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch pages
  const { data: pages = [], isLoading, error } = useQuery({
    queryKey: ['pages'],
    queryFn: () => pageApi.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageApi.delete(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page deleted successfully');
      
      // Trigger revalidation for the deleted page if it was published
      if (deletingPage && deletingPage.status === 'published' && deletingPage.isActive) {
        try {
          await fetch(`/api/revalidate/${deletingPage.slug}`, { method: 'GET' });
          console.log(`Revalidated page after deletion: /${deletingPage.slug}`);
        } catch (error) {
          console.error('Failed to revalidate page after deletion:', error);
        }
      }
      
      setDeletingPage(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete page');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      pageApi.update(id, { isActive }),
    onSuccess: async (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page status updated successfully');
      
      // Trigger revalidation when page status changes
      if (updatedPage.status === 'published') {
        try {
          await fetch(`/api/revalidate/${updatedPage.slug}`, { method: 'GET' });
          console.log(`Revalidated page after status change: /${updatedPage.slug}`);
        } catch (error) {
          console.error('Failed to revalidate page after status change:', error);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update page status');
    },
  });

  // Filter pages based on search
  const filteredPages = pages?.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = () => {
    if (deletingPage) {
      deleteMutation.mutate(deletingPage.id.toString());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-600 mt-1">
              Manage your static pages
            </p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load pages. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">
            Manage your static pages
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages?.filter(p => p.status === 'published').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pages?.filter(p => p.status === 'draft').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card key={page.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(page.status)}>
                        {page.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/pages/${page.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleStatusMutation.mutate({
                          id: page.id.toString(),
                          isActive: !page.isActive
                        })}
                      >
                        {page.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingPage(page)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {page.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {page.excerpt}
                  </p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{page.views} views</span>
                    <span>{page.readingTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {page.publishedAt && page.status === 'published' && (
                      <span>{formatDate(page.publishedAt)}</span>
                    )}
                    {page.status === 'draft' && (
                      <span>{formatDate(page.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery ? 'No pages found matching your search.' : 'No pages found.'}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link href="/admin/pages/new">
                <Plus className="w-4 h-4 mr-2" />
                Create your first page
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPage} onOpenChange={() => setDeletingPage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingPage?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeletingPage(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}