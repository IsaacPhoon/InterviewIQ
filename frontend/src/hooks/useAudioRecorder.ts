import { useState, useRef, useCallback } from 'react';
import {
  MAX_AUDIO_SIZE,
  MAX_AUDIO_SIZE_MB,
  MAX_AUDIO_DURATION_MINUTES,
  WARNING_AUDIO_SIZE,
  WARNING_AUDIO_DURATION_MINUTES,
  ESTIMATED_BITRATE_BPS,
} from '@/utils/constants';

// Time conversion constants
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isInitializing: boolean;
  audioBlob: Blob | null;
  audioURL: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearRecording: () => void;
  error: string | null;
  warning: string | null;
  estimatedMinutes: number;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const sizeCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setWarning(null);
      setEstimatedMinutes(0);
      setIsInitializing(true);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      // Handle start event - only set isRecording after actual start
      mediaRecorder.onstart = () => {
        setIsInitializing(false);
        setIsRecording(true);

        // Check recording duration and size every second
        sizeCheckIntervalRef.current = setInterval(() => {
          const elapsedMinutes = (Date.now() - recordingStartTimeRef.current) / MS_PER_SECOND / SECONDS_PER_MINUTE;
          setEstimatedMinutes(Number(elapsedMinutes.toFixed(1)));

          // Calculate current recording size
          const currentSize = chunksRef.current.reduce((total, chunk) => total + chunk.size, 0);
          const currentSizeMB = currentSize / 1024 / 1024;

          // Check and warn about size limit first
          if (currentSize >= MAX_AUDIO_SIZE) {
            setWarning(`Maximum recording size reached (${MAX_AUDIO_SIZE_MB}MB). Please stop recording.`);
          }
          else if (currentSize >= WARNING_AUDIO_SIZE) {
            setWarning(`Recording is ${currentSizeMB.toFixed(1)}MB. Maximum is ${MAX_AUDIO_SIZE_MB}MB (~${MAX_AUDIO_DURATION_MINUTES} minutes). Please stop soon.`);
          }
          // Check and warn about time limit second (can exceed time if size is under limit)
          else if (elapsedMinutes >= MAX_AUDIO_DURATION_MINUTES) {
            setWarning(`Maximum recording time reached (${MAX_AUDIO_DURATION_MINUTES} minutes). Please stop recording.`);
          }
          else if (elapsedMinutes >= WARNING_AUDIO_DURATION_MINUTES) {
            setWarning(`Recording is ${elapsedMinutes.toFixed(1)} minutes long. Maximum is ${MAX_AUDIO_DURATION_MINUTES} minutes.`);
          }
        }, 1000);
      };

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle stop event
      mediaRecorder.onstop = () => {
        // Clear interval
        if (sizeCheckIntervalRef.current) {
          clearInterval(sizeCheckIntervalRef.current);
          sizeCheckIntervalRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Check file size
        if (blob.size > MAX_AUDIO_SIZE) {
          // Estimate duration: (size in bits) / (bitrate in bps) / 60 = minutes
          const durationMins = ((blob.size * 8) / ESTIMATED_BITRATE_BPS / SECONDS_PER_MINUTE).toFixed(0);
          setError(`Recording is too large (${(blob.size / 1024 / 1024).toFixed(1)}MB, ~${durationMins} minutes). Maximum is ${MAX_AUDIO_DURATION_MINUTES} minutes.`);
          stream.getTracks().forEach((track) => track.stop());
          setWarning(null);
          return;
        }

        // Create URL after a small delay to ensure blob is fully formed
        setTimeout(() => {
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioURL(url);
          setWarning(null);
        }, 100);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording with timeslice to ensure data is captured
      mediaRecorder.start(100); // Request data every 100ms
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
      setIsInitializing(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (sizeCheckIntervalRef.current) {
      clearInterval(sizeCheckIntervalRef.current);
      sizeCheckIntervalRef.current = null;
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    setError(null);
    setWarning(null);
    setEstimatedMinutes(0);
  }, [audioURL]);

  return {
    isRecording,
    isInitializing,
    audioBlob,
    audioURL,
    startRecording,
    stopRecording,
    clearRecording,
    error,
    warning,
    estimatedMinutes,
  };
};
