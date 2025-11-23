'use client';

import React, { useState } from "react";
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

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", jobDescriptionId],
    queryFn: () => jobDescriptionsAPI.getQuestions(jobDescriptionId!),
    enabled: !!jobDescriptionId,
  });

  const {
    isRecording,
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

  const handleNextQuestion = () => {
    if (!questions) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setEvaluation(null);
      clearRecording();
    } else {
      router.push("/dashboard");
    }
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

  const currentQuestion = questions[currentQuestionIndex];

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Practice
            </h1>
            <span className="text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {currentQuestion.question_text}
          </h2>

          {/* Recording Interface */}
          <div className="space-y-4">
            {recordingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {recordingError}
              </div>
            )}

            {!evaluation && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                {!audioBlob ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-24 h-24 rounded-full flex items-center justify-center ${
                          isRecording
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-primary-600 hover:bg-primary-700"
                        }`}
                      >
                        <div className="text-white text-3xl">
                          {isRecording ? "⏸" : "🎙️"}
                        </div>
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {isRecording
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
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Response
              </h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-4 rounded">
                {evaluation.transcript}
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Evaluation Scores
              </h3>
              <div className="space-y-4">
                {Object.entries(evaluation.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace("_", " ")}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {value}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(value / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {
                        evaluation.feedback[
                          key as keyof typeof evaluation.feedback
                        ]
                      }
                    </p>
                  </div>
                ))}
              </div>
              {evaluation.overall_comment && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Overall Feedback
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {evaluation.overall_comment}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNextQuestion}
              className="btn btn-primary w-full"
            >
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "Finish Practice"}
            </button>
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
