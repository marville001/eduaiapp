"use client";

import { AlertCircle, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ApiStatusProps {
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  showConnectionStatus?: boolean;
}

export default function ApiStatus({ 
  isLoading, 
  error, 
  onRetry, 
  showConnectionStatus = true 
}: ApiStatusProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-900">Loading subjects...</p>
              <p className="text-sm text-blue-700">Connecting to API server</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-2">Connection Error</p>
              <p className="text-sm text-red-700 mb-3">
                {error.message || 'Unable to connect to the API server'}
              </p>
              <div className="flex items-center space-x-3">
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
                <span className="text-xs text-red-600">
                  Check if the API server is running
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showConnectionStatus) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Wifi className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Connected to API
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Loading skeleton for subject cards
export function SubjectCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for the entire subjects list
export function SubjectsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <SubjectCardSkeleton key={index} />
      ))}
    </div>
  );
}