export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  pdfUrl: string;
  createdAt: Date;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  question: string;
  answer: string;
  type: 'multiple-choice' | 'essay' | 'true-false';
}

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  LessonDetail: { lessonId: string };
};