"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { jobDescriptionsAPI, responsesAPI } from "@/services/api";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import type { Response as EvaluationResponse } from "@/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CustomDropdown } from "@/components/CustomDropdown";
import { QuestionTimeline } from "@/components/QuestionTimeline";
import { formatDateTime } from "@/utils/dateFormatter";
import { MAX_AUDIO_SIZE, MAX_AUDIO_SIZE_MB, MAX_AUDIO_DURATION_MINUTES } from "@/utils/constants";

function PracticeContent() {
  const params = useParams();
  const jobDescriptionId = params.jobDescriptionId as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [initialIndexSet, setInitialIndexSet] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  );

  const {
    isRecording,
    isInitializing,
    audioBlob,
    audioURL,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError,
    warning: recordingWarning,
    estimatedMinutes,
  } = useAudioRecorder();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", jobDescriptionId],
    queryFn: () => {
      if (!jobDescriptionId) throw new Error('Job description ID is required');
      return jobDescriptionsAPI.getQuestions(jobDescriptionId);
    },
    enabled: !!jobDescriptionId,
  });

  // Get current question
  const currentQuestion = questions?.[currentQuestionIndex];

  // Fetch all responses for current question if it has been answered
  const { data: previousResponses, isLoading: isLoadingResponse } = useQuery({
    queryKey: ["responses", currentQuestion?.id],
    queryFn: () => {
      if (!currentQuestion) throw new Error('Current question is required');
      return responsesAPI.list(currentQuestion.id);
    },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, previousResponses]);

  // Update evaluation when selected response changes
  useEffect(() => {
    if (selectedResponseId && previousResponses) {
      const selected = previousResponses.find(
        (r) => r.response_id === selectedResponseId
      );
      if (selected) {
        setEvaluation(selected);
        setIsViewingHistory(true);
      }
    }
  }, [selectedResponseId, previousResponses]);

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
      queryClient.invalidateQueries({
        queryKey: ["questions", jobDescriptionId],
      });
      // Invalidate responses query to show the new response
      queryClient.invalidateQueries({
        queryKey: ["responses", currentQuestion?.id],
      });
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!audioBlob || !questions) return;

    // Validate audio file size
    if (audioBlob.size > MAX_AUDIO_SIZE) {
      setSubmitError(`Audio file is too large (${(audioBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_AUDIO_SIZE_MB}MB (~${MAX_AUDIO_DURATION_MINUTES} minutes).`);
      return;
    }

    setSubmitError(null);
    const currentQuestion = questions[currentQuestionIndex];
    const audioFile = new File([audioBlob], "response.webm", {
      type: "audio/webm",
    });

    submitMutation.mutate({
      questionId: currentQuestion.id,
      audioFile,
    });
  };

  const _handlePreviousQuestion = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => router.push("/dashboard")}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mb-6 flex items-center gap-2 font-medium"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </motion.button>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Practice
            </h1>
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Question{" "}
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {currentQuestionIndex + 1}
                </span>{" "}
                of {questions.length}
              </span>
            </div>
          </div>
          {/* Question Timeline */}
          <QuestionTimeline
            questions={questions}
            currentIndex={currentQuestionIndex}
            onSelectQuestion={setCurrentQuestionIndex}
          />
        </motion.div>

        {/* Question Card */}
        <motion.div
          className="card mb-8 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
              <span className="flex-shrink-0 text-2xl">❓</span>
              <span className="flex-1">{currentQuestion.question_text}</span>
            </h2>
            {previousResponses && previousResponses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  View Previous Attempts:
                </label>
                <CustomDropdown
                  options={previousResponses.map((response, index) => {
                    const avgScore =
                      Object.values(response.scores).reduce(
                        (a, b) => a + b,
                        0
                      ) / Object.keys(response.scores).length;
                    return {
                      value: response.response_id,
                      label: `Attempt ${previousResponses.length - index}`,
                      metadata: {
                        score: avgScore,
                        date: formatDateTime(response.created_at),
                      },
                    };
                  })}
                  value={selectedResponseId}
                  onChange={setSelectedResponseId}
                  placeholder="Select a response"
                />
              </motion.div>
            )}
          </div>

          {/* Recording Interface */}
          <div className="space-y-4">
            {recordingError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
              >
                {recordingError}
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
              >
                {submitError}
              </motion.div>
            )}

            {recordingWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg font-medium"
              >
                ⚠️ {recordingWarning}
              </motion.div>
            )}

            {!evaluation && !isLoadingResponse && (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 text-center">
                {!audioBlob ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isInitializing}
                        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                          isRecording
                            ? "bg-red-600 hover:bg-red-700"
                            : isInitializing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                        }`}
                        whileHover={!isInitializing ? { scale: 1.05 } : {}}
                        whileTap={!isInitializing ? { scale: 0.95 } : {}}
                        animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
                        transition={
                          isRecording ? { duration: 1, repeat: Infinity } : {}
                        }
                      >
                        <div className="text-white text-3xl">
                          {isInitializing ? "⏳" : isRecording ? "⏸" : "🎙️"}
                        </div>
                      </motion.button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 font-medium">
                      {isInitializing
                        ? "Initializing microphone..."
                        : isRecording
                        ? "Recording... Click to stop"
                        : "Click to start recording"}
                    </p>
                    {isRecording && estimatedMinutes > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {estimatedMinutes} minute{estimatedMinutes !== 1 ? 's' : ''} elapsed
                      </p>
                    )}
                  </div>
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.p
                      className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Recording complete
                    </motion.p>
                    {audioURL && (
                      <audio
                        src={audioURL}
                        controls
                        className="w-full"
                        preload="metadata"
                      />
                    )}
                    <div className="flex gap-4">
                      <motion.button
                        onClick={clearRecording}
                        className="btn btn-secondary flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Record Again
                      </motion.button>
                      <motion.button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="btn btn-primary flex-1 shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {submitMutation.isPending
                          ? "Submitting..."
                          : "Submit Response"}
                      </motion.button>
                    </div>
                    {submitMutation.isPending && (
                      <motion.p
                        className="text-sm text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Transcribing and evaluating... This may take 10-30
                        seconds.
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Evaluation Results */}
        {evaluation && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Transcript Section */}
            <motion.div
              className="card backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Response
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transcribed from audio
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-4 italic">
                  "{evaluation.transcript}"
                </p>
              </div>
            </motion.div>

            {/* Overall Summary Card */}
            {evaluation.overall_comment && (
              <motion.div
                className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
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
              </motion.div>
            )}

            {/* Scores Grid */}
            <motion.div
              className="card backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Performance Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(evaluation.scores).map(([key, value]) => {
                  const percentage = (value / 10) * 100;
                  const getScoreColor = (score: number) => {
                    if (score >= 8)
                      return {
                        bg: "bg-green-500",
                        text: "text-green-600 dark:text-green-400",
                        ring: "ring-green-100 dark:ring-green-900",
                      };
                    if (score >= 6)
                      return {
                        bg: "bg-blue-500",
                        text: "text-blue-600 dark:text-blue-400",
                        ring: "ring-blue-100 dark:ring-blue-900",
                      };
                    if (score >= 4)
                      return {
                        bg: "bg-yellow-500",
                        text: "text-yellow-600 dark:text-yellow-400",
                        ring: "ring-yellow-100 dark:ring-yellow-900",
                      };
                    return {
                      bg: "bg-red-500",
                      text: "text-red-600 dark:text-red-400",
                      ring: "ring-red-100 dark:ring-red-900",
                    };
                  };
                  const colors = getScoreColor(value);

                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.ring} ring-2`}
                        >
                          <span className={`text-sm font-bold ${colors.text}`}>
                            {value}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            /10
                          </span>
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
                        {
                          evaluation.feedback[
                            key as keyof typeof evaluation.feedback
                          ]
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isViewingHistory && (
                <motion.button
                  onClick={handleTryAgain}
                  className="btn btn-secondary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-4 h-4 inline-block mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </motion.button>
              )}
              <motion.button
                onClick={handleNextQuestion}
                className={`btn btn-primary shadow-md ${
                  isViewingHistory ? "flex-1" : "w-full"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "Back to Dashboard"}
                <svg
                  className="w-4 h-4 inline-block ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
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
