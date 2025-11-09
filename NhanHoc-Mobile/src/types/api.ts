/**
 * API Types & Interfaces
 * Định nghĩa các kiểu dữ liệu cho API requests và responses
 */

// ============= Common Types =============

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BaseJobResponse {
  job_id: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error?: string;
}

export interface JobCreateResponse {
  job_id: string;
  status: 'pending';
  message: string;
}

// ============= Roadmap API Types =============

export interface RoadmapRequest {
  topic: string;
  time: string;
  knowledge_level: 'Absolute Beginner' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface SubTopic {
  'chủ đề con': string;
  'thời gian': string;
  'mô tả': string;
}

export interface WeekTopic {
  'chủ đề': string;
  'các chủ đề con': SubTopic[];
}

export type RoadmapResult = Record<string, WeekTopic>;

export interface RoadmapJobStatus extends BaseJobResponse {
  result?: RoadmapResult;
}

// ============= Quiz API Types =============

export interface QuizRequest {
  course: string;
  topic: string;
  subtopic: string;
  description: string;
  num_questions?: number; // Số câu hỏi trong quiz (mặc định 5)
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  reason: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
}

export interface QuizJobStatus extends BaseJobResponse {
  result?: QuizResult;
}

// ============= Resource API Types =============

export interface ResourceRequest {
  course: string;
  knowledge_level: string;
  description: string;
  time: string;
}

export interface ResourceJobStatus extends BaseJobResponse {
  result?: string; // Markdown content
}

// ============= Chat API Types =============

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContextData {
  roadmaps?: Record<string, RoadmapResult>;
  quizStats?: Record<string, any>;
  resourceCount?: number;
}

export interface ChatJobResponse {
  job_id: string;
  status: 'pending';
  message: string;
}

export interface ChatJobStatus extends BaseJobResponse {
  result?: string; // AI response text
  messages?: ChatMessage[];
  user_data?: UserContextData;
}

// ============= API Error Types =============

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export class ApiException extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// ============= API Config Types =============

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
}
