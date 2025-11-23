import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { jobDescriptionsAPI } from "@/services/api";

export const Upload: React.FC = () => {
  const [descriptionText, setDescriptionText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Job Description
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter a job description to generate tailored interview questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., Google, Microsoft, Startup Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g., Senior Software Engineer, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description
            </label>
            <textarea
              required
              rows={12}
              className="input resize-y"
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
            <p className="mt-1 text-sm text-gray-500">
              {descriptionText.length} characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !descriptionText.trim()}
              className="btn btn-primary flex-1"
            >
              {mutation.isPending ? "Generating..." : "Generate Questions"}
            </button>
          </div>

          {mutation.isPending && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Generating interview questions...</p>
              <p className="mt-1">This may take 10-30 seconds.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
