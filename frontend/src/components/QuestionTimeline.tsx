'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Question {
  id: string;
  attempts_count?: number;
}

interface QuestionTimelineProps {
  questions: Question[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
}

export const QuestionTimeline: React.FC<QuestionTimelineProps> = ({
  questions,
  currentIndex,
  onSelectQuestion,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {questions.map((question, index) => {
        const isAnswered = (question.attempts_count ?? 0) > 0;
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;

        return (
          <div key={question.id} className="flex items-center">
            {/* Question dot */}
            <motion.button
              onClick={() => onSelectQuestion(index)}
              className={`relative flex items-center justify-center transition-all ${
                isCurrent ? 'w-12 h-12' : 'w-10 h-10'
              }`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 400 }}
            >
              {/* Outer ring for current question */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/20 dark:bg-blue-400/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Inner circle */}
              <div
                className={`relative z-10 w-full h-full rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isCurrent
                    ? 'bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg'
                    : isAnswered
                    ? 'bg-green-500 dark:bg-green-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              >
                {isAnswered && !isCurrent ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Question {index + 1}
                </span>
              </div>
            </motion.button>

            {/* Connecting line */}
            {index < questions.length - 1 && (
              <div className="relative w-8 h-1 mx-1">
                <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <motion.div
                  className={`absolute inset-0 rounded-full ${
                    isPast ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isPast ? 1 : 0 }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
