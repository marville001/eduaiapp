"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Plus, Search, Edit, Eye } from "lucide-react";
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
import { subjectApi, Subject } from "@/lib/api/subject.api";

// Mock prompt type - this should be defined in your API types
interface SubjectPrompt {
  id: string;
  subjectId: string;
  subject: Subject;
  prompt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AIPromptsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SubjectPrompt | null>(null);

  // Fetch subjects for the dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll(),
  });

  // Mock prompts data - replace with actual API call
  const mockPrompts: SubjectPrompt[] = subjects.map((subject, index) => ({
    id: `prompt-${index + 1}`,
    subjectId: subject.subjectId,
    subject,
    prompt: `You are an expert ${subject.name} tutor. Help students understand concepts clearly and provide step-by-step explanations. Always encourage critical thinking and ask follow-up questions to ensure understanding.`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Filter prompts based on search
  const filteredPrompts = mockPrompts.filter(prompt =>
    prompt.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (prompt: SubjectPrompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPrompt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Prompts</h1>
          <p className="text-gray-600 mt-1">
            Configure AI prompts for each subject to enhance tutoring quality
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prompt
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prompts</p>
                <p className="text-2xl font-bold text-gray-900">{mockPrompts.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prompts</p>
                <p className="text-2xl font-bold text-green-900">
                  {mockPrompts.filter(p => p.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Subjects Covered</p>
                <p className="text-2xl font-bold text-blue-900">{subjects.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prompts by subject or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No prompts found matching your search.' : 'No AI prompts configured yet.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Prompt
              </Button>
            )}
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{prompt.subject.name}</CardTitle>
                      <p className="text-sm text-gray-500">Subject Prompt</p>
                    </div>
                  </div>
                  <Badge
                    variant={prompt.isActive ? "default" : "secondary"}
                    className={prompt.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {prompt.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {prompt.prompt}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(prompt.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Dialog - TODO: Create PromptForm component */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? 'Edit AI Prompt' : 'Add New AI Prompt'}
            </DialogTitle>
            <DialogDescription>
              Configure AI prompts to enhance tutoring quality for specific subjects.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> AI Prompt management functionality will be implemented in the next phase. 
              This interface shows the planned design and structure.
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleFormClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}