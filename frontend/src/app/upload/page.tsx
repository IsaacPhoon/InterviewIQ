'use client';

import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jobDescriptionsAPI } from "@/services/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function UploadContent() {
  const [descriptionText, setDescriptionText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      textarea.style.overflowX = "hidden"; // Prevent horizontal scrolling

      // Calculate the number of lines
      const lineHeight = 24; // Approximate line height in pixels
      const lines = Math.ceil(textarea.scrollHeight / lineHeight);

      // Set minimum 5 rows, maximum 5 rows with scrolling
      if (lines <= 5) {
        textarea.style.height = `${Math.max(lines, 5) * lineHeight}px`;
        textarea.style.overflowY = "hidden";
      } else {
        // Cap at 5 rows and enable scrolling
        textarea.style.height = `${5 * lineHeight}px`;
        textarea.style.overflowY = "auto";
      }
    }
  }, [descriptionText]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!descriptionText.trim())
        throw new Error("Job description is required");
      return jobDescriptionsAPI.create(companyName, jobTitle, descriptionText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
      router.push("/dashboard");
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.detail ||
          "Failed to create job description. Please try again."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionText.trim() || !companyName || !jobTitle) {
      setError("Please fill in all fields");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => router.push("/dashboard")}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-6 text-lg font-medium flex items-center gap-2"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </motion.button>
          <motion.h1
            className="text-5xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Create Job Description
          </motion.h1>
          <motion.p
            className="mt-3 text-xl text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Enter a job description to generate tailored interview questions
          </motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="card space-y-8 p-10 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: "2rem" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg text-lg overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-xl">🏢</span>
              Company Name
            </label>
            <motion.input
              type="text"
              required
              className="input text-lg py-4 px-5 transition-all"
              placeholder="e.g., Google, Microsoft, Startup Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              whileFocus={{ scale: 1.01, borderColor: "#0284c7" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-xl">💼</span>
              Job Title
            </label>
            <motion.input
              type="text"
              required
              className="input text-lg py-4 px-5 transition-all"
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              whileFocus={{ scale: 1.01, borderColor: "#0284c7" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-xl">📄</span>
              Job Description
            </label>
            <motion.textarea
              ref={textareaRef}
              required
              className="input resize-none text-lg py-4 px-5 leading-relaxed overflow-x-hidden whitespace-pre-wrap break-words transition-all"
              placeholder="Paste the job description here...

Example:
We are seeking a talented Software Engineer to join our team. The ideal candidate will have:
- 3+ years of experience in software development
- Strong knowledge of React, Node.js, and TypeScript
- Experience with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving and communication skills

Responsibilities:
- Design and implement scalable web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews and technical discussions"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              whileFocus={{ scale: 1.005, borderColor: "#0284c7" }}
            />
            <motion.p
              className="mt-2 text-base"
              animate={{
                color: descriptionText.length < 100
                  ? "#ef4444"
                  : descriptionText.length < 300
                  ? "#f59e0b"
                  : "#10b981"
              }}
            >
              {descriptionText.length} characters
              {descriptionText.length < 100 && " (minimum 100 recommended)"}
            </motion.p>
          </motion.div>

          <motion.div
            className="flex gap-6 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn btn-secondary flex-1 text-lg py-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={mutation.isPending || !descriptionText.trim()}
              className="btn btn-primary flex-1 text-lg py-4 shadow-lg relative overflow-hidden group"
              whileHover={{ scale: mutation.isPending ? 1 : 1.02 }}
              whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {mutation.isPending ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⚙️
                    </motion.span>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Questions
                  </>
                )}
              </span>
              {!mutation.isPending && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              )}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {mutation.isPending && (
              <motion.div
                className="text-center text-lg text-gray-600 dark:text-gray-300 py-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <motion.p
                  className="font-semibold flex items-center justify-center gap-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ⚙️
                  </motion.span>
                  Generating interview questions...
                </motion.p>
                <p className="mt-2">This may take 10-30 seconds.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  );
}
