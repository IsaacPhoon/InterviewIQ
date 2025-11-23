import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { jobDescriptionsAPI } from "@/services/api";

export const Upload: React.FC = () => {
  const [descriptionText, setDescriptionText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const navigate = useNavigate();
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
      navigate("/dashboard");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-6 text-lg font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Create Job Description
          </h1>
          <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
            Enter a job description to generate tailored interview questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-8 p-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Company Name
            </label>
            <input
              type="text"
              required
              className="input text-lg py-4 px-5"
              placeholder="e.g., Google, Microsoft, Startup Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Job Title
            </label>
            <input
              type="text"
              required
              className="input text-lg py-4 px-5"
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Job Description
            </label>
            <textarea
              ref={textareaRef}
              required
              className="input resize-none text-lg py-4 px-5 leading-relaxed overflow-x-hidden whitespace-pre-wrap break-words"
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
            />
            <p className="mt-2 text-base text-gray-500">
              {descriptionText.length} characters
            </p>
          </div>

          <div className="flex gap-6 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary flex-1 text-lg py-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !descriptionText.trim()}
              className="btn btn-primary flex-1 text-lg py-4"
            >
              {mutation.isPending ? "Generating..." : "Generate Questions"}
            </button>
          </div>

          {mutation.isPending && (
            <div className="text-center text-lg text-gray-600 dark:text-gray-400 py-4">
              <p className="font-semibold">Generating interview questions...</p>
              <p className="mt-2">This may take 10-30 seconds.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
