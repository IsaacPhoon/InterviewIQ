'use client';

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { jobDescriptionsAPI, responsesAPI } from "@/services/api";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { Response as EvaluationResponse } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function PracticeContent() {
  const params = useParams();
  const jobDescriptionId = params.jobDescriptionId as string;
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [initialIndexSet, setInitialIndexSet] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", jobDescriptionId],
    queryFn: () => jobDescriptionsAPI.getQuestions(jobDescriptionId!),
    enabled: !!jobDescriptionId,
  });

  // Get current question
  const currentQuestion = questions?.[currentQuestionIndex];

  // Fetch all responses for current question if it has been answered
  const { data: previousResponses, isLoading: isLoadingResponse } = useQuery({
    queryKey: ["responses", currentQuestion?.id],
    queryFn: () => responsesAPI.list(currentQuestion!.id),
    enabled: !!currentQuestion && (currentQuestion.attempts_count ?? 0) > 0,
    retry: false,
  });

  // Set initial question index to first unanswered question
  useEffect(() => {
    if (questions && questions.length > 0 && !initialIndexSet) {
      const firstUnanswered = questions.findIndex(
        (q) => !q.attempts_count || q.attempts_count === 0
      );
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered);
      }
      setInitialIndexSet(true);
    }
  }, [questions, initialIndexSet]);

  // Load latest response when changing questions
  useEffect(() => {
    if (previousResponses && previousResponses.length > 0) {
      const latestResponse = previousResponses[0]; // Already sorted by created_at desc
      setSelectedResponseId(latestResponse.response_id);
      setEvaluation(latestResponse);
      setIsViewingHistory(true);
    } else {
      setSelectedResponseId(null);
      setEvaluation(null);
      setIsViewingHistory(false);
    }
    clearRecording();
  }, [currentQuestionIndex, previousResponses]);

  // Update evaluation when selected response changes
  useEffect(() => {
    if (selectedResponseId && previousResponses) {
      const selected = previousResponses.find(r => r.response_id === selectedResponseId);
      if (selected) {
        setEvaluation(selected);
        setIsViewingHistory(true);
      }
    }
  }, [selectedResponseId, previousResponses]);

  const {
    isRecording,
    isInitializing,
    audioBlob,
    audioURL,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError,
  } = useAudioRecorder();

  const submitMutation = useMutation({
    mutationFn: ({
      questionId,
      audioFile,
    }: {
      questionId: string;
      audioFile: File;
    }) => responsesAPI.submit(questionId, audioFile),
    onSuccess: (data) => {
      setEvaluation(data);
      setIsViewingHistory(false);
      // Invalidate questions query to update attempts_count
      // This will refresh the data but won't change currentQuestionIndex
    },
  });

  const handleSubmit = () => {
    if (!audioBlob || !questions) return;

    const currentQuestion = questions[currentQuestionIndex];
    const audioFile = new File([audioBlob], "response.webm", {
      type: "audio/webm",
    });

    submitMutation.mutate({
      questionId: currentQuestion.id,
      audioFile,
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (!questions) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleTryAgain = () => {
    setEvaluation(null);
    setIsViewingHistory(false);
    clearRecording();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading questions...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">No questions found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-4"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Practice
            </h1>
            <span className="text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          {/* Question Navigation */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {currentQuestion.question_text}
            </h2>
            {previousResponses && previousResponses.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  View Response:
                </label>
                <select
                  value={selectedResponseId || ""}
                  onChange={(e) => setSelectedResponseId(e.target.value)}
                  className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {previousResponses.map((response, index) => (
                    <option key={response.response_id} value={response.response_id}>
                      Attempt {previousResponses.length - index} - {new Date(response.created_at).toLocaleDateString()} {new Date(response.created_at).toLocaleTimeString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Recording Interface */}
          <div className="space-y-4">
            {recordingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {recordingError}
              </div>
            )}

            {!evaluation && !isLoadingResponse && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                {!audioBlob ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isInitializing}
                        className={`w-24 h-24 rounded-full flex items-center justify-center ${
                          isRecording
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : isInitializing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                        }`}
                      >
                        <div className="text-white text-3xl">
                          {isInitializing ? "⏳" : isRecording ? "⏸" : "🎙️"}
                        </div>
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {isInitializing
                        ? "Initializing microphone..."
                        : isRecording
                        ? "Recording... Click to stop"
                        : "Click to start recording"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-600 dark:text-green-400">
                      ✓ Recording complete
                    </p>
                    {audioURL && (
                      <audio
                        src={audioURL}
                        controls
                        className="w-full"
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          // Force the audio player to update its display
                          const audio = e.currentTarget;
                          audio.currentTime = 0;
                        }}
                      />
                    )}
                    <div className="flex gap-4">
                      <button
                        onClick={clearRecording}
                        className="btn btn-secondary flex-1"
                      >
                        Record Again
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="btn btn-primary flex-1"
                      >
                        {submitMutation.isPending
                          ? "Submitting..."
                          : "Submit Response"}
                      </button>
                    </div>
                    {submitMutation.isPending && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transcribing and evaluating... This may take 10-30
                        seconds.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Results */}
        {evaluation && (
          <div className="space-y-6">
            {/* Transcript Section */}
            <div className="card">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Response
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Transcribed from audio</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-4 italic">
                  "{evaluation.transcript}"
                </p>
              </div>
            </div>

            {/* Overall Summary Card */}
            {evaluation.overall_comment && (
              <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Overall Assessment
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {evaluation.overall_comment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scores Grid */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Performance Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(evaluation.scores).map(([key, value]) => {
                  const percentage = (value / 10) * 100;
                  const getScoreColor = (score: number) => {
                    if (score >= 8) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-100 dark:ring-green-900' };
                    if (score >= 6) return { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-900' };
                    if (score >= 4) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-100 dark:ring-yellow-900' };
                    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-100 dark:ring-red-900' };
                  };
                  const colors = getScoreColor(value);

                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.ring} ring-2`}>
                          <span className={`text-sm font-bold ${colors.text}`}>
                            {value}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">/10</span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full ${colors.bg} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {evaluation.feedback[key as keyof typeof evaluation.feedback]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isViewingHistory && (
                <button
                  onClick={handleTryAgain}
                  className="btn btn-secondary flex-1"
                >
                  <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              )}
              <button
                onClick={handleNextQuestion}
                className={`btn btn-primary ${isViewingHistory ? 'flex-1' : 'w-full'}`}
              >
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "Back to Dashboard"}
                <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <ProtectedRoute>
      <PracticeContent />
    </ProtectedRoute>
  );
}
