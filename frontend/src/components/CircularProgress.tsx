'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  answered: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  answered,
  total,
  size = 'md',
}) => {
  const percentage = total > 0 ? (answered / total) * 100 : 0;
  const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Color based on completion
  const getColor = () => {
    if (percentage === 100) return { stroke: '#10b981', text: 'text-green-600 dark:text-green-400' }; // green
    if (percentage >= 50) return { stroke: '#3b82f6', text: 'text-blue-600 dark:text-blue-400' }; // blue
    if (percentage > 0) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400' }; // amber
    return { stroke: '#6b7280', text: 'text-gray-600 dark:text-gray-400' }; // gray
  };

  const colors = getColor();
  const svgSize = size === 'sm' ? 48 : size === 'md' ? 64 : 80;
  const center = svgSize / 2;

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]}`}>
      <svg className={sizeClasses[size]} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.stroke}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' }}
        />
      </svg>
      <div className={`absolute flex flex-col items-center justify-center ${textSizeClasses[size]}`}>
        <span className={`font-bold ${colors.text}`}>
          {answered}/{total}
        </span>
      </div>
    </div>
  );
};
