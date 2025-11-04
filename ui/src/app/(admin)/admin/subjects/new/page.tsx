"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SubjectForm from "../components/subject-form";

export default function NewSubjectPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/subjects");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Subject</h1>
          <p className="text-gray-600 mt-1">
            Create a new subject for the platform
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}