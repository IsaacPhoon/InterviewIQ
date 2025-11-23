"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { jobDescriptionsAPI } from "@/services/api";
import type { JobDescription } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CircularProgress } from "@/components/CircularProgress";
import { formatDateOnly } from "@/utils/dateFormatter";

function DashboardContent() {
  const router = useRouter();
  const { logout } = useAuth();

  const { data: jobDescriptions, isLoading } = useQuery({
    queryKey: ["jobDescriptions"],
    queryFn: jobDescriptionsAPI.list,
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      questions_generated:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      badges[status as keyof typeof badges] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: "⏳",
      questions_generated: "✓",
      error: "⚠️",
    };
    return icons[status as keyof typeof icons] || "•";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold text-gray-900 dark:text-white"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            InterviewIQ
          </motion.h1>
          <motion.button
            onClick={logout}
            className="btn btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Interview Prep Sessions
          </h2>
          <motion.button
            onClick={() => router.push("/upload")}
            className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              +
            </motion.span>
            Upload New Job Description
          </motion.button>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : jobDescriptions && jobDescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-4 gap-6">
            {jobDescriptions.map((job: JobDescription, index: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="card hover:shadow-2xl transition-all backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 hover:border-primary-400 dark:hover:border-primary-500"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <motion.span
                          whileHover={{ rotate: 15, scale: 1.2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          💼
                        </motion.span>
                        {job.job_title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {job.company_name}
                      </p>
                    </div>
                    {job.status === "questions_generated" &&
                      job.answered_questions !== undefined &&
                      job.total_questions !== undefined &&
                      job.total_questions > 0 && (
                        <CircularProgress
                          answered={job.answered_questions}
                          total={job.total_questions}
                          size="sm"
                        />
                      )}
                  </div>

                  <div className="flex items-center justify-between">
                    <motion.span
                      animate={
                        job.status === "pending"
                          ? { opacity: [0.7, 1, 0.7] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      <span className="text-base">
                        {getStatusIcon(job.status)}
                      </span>
                      {job.status
                        .replace("_", " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </motion.span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateOnly(job.created_at)}
                    </span>
                  </div>

                  {job.error_message && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      {job.error_message}
                    </motion.p>
                  )}

                  {job.status === "questions_generated" && (
                    <motion.button
                      onClick={() => router.push(`/practice/${job.id}`)}
                      className="btn btn-primary w-full relative overflow-hidden group shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {job.answered_questions &&
                        job.answered_questions > 0 ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                            Continue Practice
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Start Practice
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              📋
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              No job descriptions yet. Upload one to get started!
            </p>
            <motion.button
              onClick={() => router.push("/upload")}
              className="btn btn-primary shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Job Description
            </motion.button>
          </motion.div>
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
