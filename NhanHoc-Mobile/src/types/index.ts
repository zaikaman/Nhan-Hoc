// Common types for the app

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export type AccentColor = 'blue' | 'purple' | 'orange' | 'green';

export interface Habit {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
}

export interface FocusSession {
  id: string;
  title: string;
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
}

export interface Highlight {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  accent: AccentColor;
}

export interface QuickAction {
  icon: string;
  label: string;
  accent: AccentColor;
  action: () => void;
}

export interface WellnessStore {
  userName: string;
  mood: Mood;
  selectedDay: string;
  highlights: Highlight[];
  habits: Habit[];
  focusSessions: FocusSession[];
  toggleHabit: (habitId: string) => void;
  completeQuickAction: (action: { type: string; habitId?: string; title?: string; duration?: number }) => void;
}

// Nhàn Học types
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
  Main: undefined;
  LessonDetail: { lessonId: string };
};

export type DrawerParamList = {
  Dashboard: undefined;
  UploadDocument: undefined;
  Exercises: undefined;
  Statistics: undefined;
  Settings: undefined;
  Profile: undefined;
  Chat: undefined;
  Recommendations: undefined;
  PdfAnalysis: undefined;
  AdditionalFeatures: undefined;
};
