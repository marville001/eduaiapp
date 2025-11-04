"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, EyeOff, Eye, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Subject } from "@/lib/api/subject.api";

interface SubjectItemProps {
  subject: Subject;
  level?: number;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onToggleStatus: (subject: Subject) => void;
  isToggling?: boolean;
}

export function SubjectItem({ 
  subject, 
  level = 0, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isToggling = false 
}: SubjectItemProps) {
  return (
    <div className="border-l-2 border-transparent">
      {/* Current Subject */}
      <div 
        className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-100"
        style={{ paddingLeft: `${24 + (level * 32)}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              {level > 0 && (
                <div className="flex items-center text-gray-400">
                  <div className="w-6 h-6 border-l-2 border-b-2 border-gray-300 mr-2 -mt-3"></div>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {subject.name}
              </h3>
              <Badge
                variant={subject.isActive ? "default" : "secondary"}
                className={subject.isActive ? "bg-green-100 text-green-800" : ""}
              >
                {subject.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {level === 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Main Subject
                </Badge>
              )}
              {level > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Sub Subject
                </Badge>
              )}
              {subject.subSubjects && subject.subSubjects.length > 0 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                  {subject.subSubjects.length} children
                </Badge>
              )}
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
              onClick={() => onToggleStatus(subject)}
              disabled={isToggling}
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
                <DropdownMenuItem onClick={() => onEdit(subject)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Quick Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(subject)}
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

      {/* Render children recursively */}
      {subject.subSubjects && subject.subSubjects.length > 0 && (
        <div className="border-l-2 border-gray-200 ml-6">
          {subject.subSubjects.map((childSubject) => (
            <SubjectItem
              key={childSubject.id}
              subject={childSubject}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              isToggling={isToggling}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface HierarchicalSubjectListProps {
  subjects: Subject[];
  searchQuery?: string;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onToggleStatus: (subject: Subject) => void;
  isToggling?: boolean;
}

export function HierarchicalSubjectList({
  subjects,
  searchQuery = "",
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false
}: HierarchicalSubjectListProps) {
  // Filter subjects based on search query (recursive search through hierarchy)
  const filterSubjects = (subjects: Subject[], query: string): Subject[] => {
    if (!query.trim()) return subjects;
    
    return subjects.filter(subject => {
      // Check if current subject matches
      const subjectMatches = subject.name.toLowerCase().includes(query.toLowerCase()) ||
        subject.description?.toLowerCase().includes(query.toLowerCase());
      
      // Check if any children match
      const childrenMatch = subject.subSubjects ? 
        filterSubjects(subject.subSubjects, query).length > 0 : false;
      
      // Include subject if it matches or has matching children
      if (subjectMatches || childrenMatch) {
        // If including this subject, also filter its children
        if (subject.subSubjects) {
          subject.subSubjects = filterSubjects(subject.subSubjects, query);
        }
        return true;
      }
      
      return false;
    });
  };

  const filteredSubjects = filterSubjects([...subjects], searchQuery);

  if (filteredSubjects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          {searchQuery ? 'No subjects found matching your search.' : 'No subjects available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {filteredSubjects.map((subject) => (
        <SubjectItem
          key={subject.id}
          subject={subject}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          isToggling={isToggling}
        />
      ))}
    </div>
  );
}