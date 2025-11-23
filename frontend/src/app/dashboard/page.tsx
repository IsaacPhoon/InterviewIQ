'use client';

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { jobDescriptionsAPI } from "@/services/api";
import type { JobDescription } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function DashboardContent() {
  const router = useRouter();
  const { logout } = useAuth();

  const { data: jobDescriptions, isLoading } = useQuery({
    queryKey: ["jobDescriptions"],
    queryFn: jobDescriptionsAPI.list,
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      questions_generated: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            InterviewIQ
          </h1>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Interview Prep Sessions
          </h2>
          <button
            onClick={() => router.push("/upload")}
            className="btn btn-primary"
          >
            + Upload New Job Description
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : jobDescriptions && jobDescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobDescriptions.map((job: JobDescription) => (
              <div
                key={job.id}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {job.job_title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {job.company_name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      {job.status
                        .replace("_", " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {job.error_message && (
                    <p className="text-sm text-red-600">{job.error_message}</p>
                  )}

                  {job.status === "questions_generated" && (
                    <button
                      onClick={() => router.push(`/practice/${job.id}`)}
                      className="btn btn-primary w-full"
                    >
                      Start Practice
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No job descriptions yet. Upload one to get started!
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="btn btn-primary"
            >
              Upload Job Description
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
