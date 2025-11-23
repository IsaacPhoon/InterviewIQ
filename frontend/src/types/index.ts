export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  status: 'pending' | 'questions_generated' | 'error';
  error_message?: string;
  created_at: string;
  total_questions?: number;
  answered_questions?: number;
}

export interface Question {
  id: string;
  job_description_id: string;
  question_text: string;
  created_at: string;
  attempts_count?: number;
  last_score?: number;
}

export interface Scores {
  confidence: number;
  clarity_structure: number;
  technical_depth: number;
  communication_skills: number;
  relevance: number;
}

export interface Feedback {
  confidence: string;
  clarity_structure: string;
  technical_depth: string;
  communication_skills: string;
  relevance: string;
}

export interface Evaluation {
  scores: Scores;
  feedback: Feedback;
  overall_comment?: string;
}

export interface Response {
  response_id: string;
  transcript: string;
  scores: Scores;
  feedback: Feedback;
  overall_comment?: string;
  created_at: string;
}

export interface ResponseListItem {
  response_id: string;
  created_at: string;
  scores: Scores;
}
