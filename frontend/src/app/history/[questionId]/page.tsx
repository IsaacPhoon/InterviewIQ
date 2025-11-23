"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { responsesAPI } from "@/services/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { formatDateTime } from "@/utils/dateFormatter";

function HistoryContent() {
  const params = useParams();
  const questionId = params.questionId as string;
  const router = useRouter();

  const { data: responses, isLoading } = useQuery({
    queryKey: ["responses", questionId],
    queryFn: () => responsesAPI.list(questionId!),
    enabled: !!questionId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Practice History
          </h1>
        </div>

        {!responses || responses.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No practice attempts yet for this question.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.response_id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Attempt from {formatDateTime(response.created_at)}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(response.scores).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace("_", " ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
