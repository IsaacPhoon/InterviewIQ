/**
 * Application-wide constants
 */

// Audio constraints - single source of truth for all audio limits
export const MAX_AUDIO_SIZE_MB = 30; // 30MB maximum file size
export const MAX_AUDIO_SIZE = MAX_AUDIO_SIZE_MB * 1024 * 1024; // 30MB in bytes
export const MAX_AUDIO_DURATION_MINUTES = 30; // 30 minutes maximum duration

// Warning thresholds (when to show warnings to users)
export const WARNING_AUDIO_SIZE_MB = 25; // 25MB
export const WARNING_AUDIO_SIZE = WARNING_AUDIO_SIZE_MB * 1024 * 1024; // 25MB in bytes
export const WARNING_AUDIO_DURATION_MINUTES = 25; // 25 minutes

// Audio encoding constants
export const ESTIMATED_BITRATE_BPS = 128 * 1024; // 128kbps estimated bitrate

// TESTING: Uncomment these values to test audio limits quickly (10-15 seconds)
// export const MAX_AUDIO_SIZE_MB = 0.3; // 300KB
// export const MAX_AUDIO_SIZE = MAX_AUDIO_SIZE_MB * 1024 * 1024; // 300KB in bytes
// export const MAX_AUDIO_DURATION_MINUTES = 15 / 60; // 15 seconds
// export const WARNING_AUDIO_SIZE_MB = 0.2; // 200KB
// export const WARNING_AUDIO_SIZE = WARNING_AUDIO_SIZE_MB * 1024 * 1024; // 200KB in bytes
// export const WARNING_AUDIO_DURATION_MINUTES = 10 / 60; // 10 seconds

// Job Description text limits
export const JOB_DESCRIPTION_COMPANY_NAME_MAX_LENGTH = 200;
export const JOB_DESCRIPTION_JOB_TITLE_MAX_LENGTH = 200;
export const JOB_DESCRIPTION_TEXT_MIN_LENGTH = 50;
export const JOB_DESCRIPTION_TEXT_MAX_LENGTH = 10000;
