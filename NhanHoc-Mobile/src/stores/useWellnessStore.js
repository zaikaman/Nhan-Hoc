import { create } from "zustand";

const defaultHabits = [
  {
    id: "hydrate",
    title: "Uống đủ nước",
    description: "8 ly mỗi ngày",
    streak: 4,
    completed: true
  },
  {
    id: "focus",
    title: "Tập trung 25 phút",
    description: "Phiên Pomodoro",
    streak: 2,
    completed: false
  },
  {
    id: "walk",
    title: "Đi bộ nhẹ",
    description: "2.000 bước",
    streak: 6,
    completed: false
  }
];

const defaultHighlights = [
  {
    id: "energy",
    label: "Năng lượng",
    value: 82,
    trend: +6,
    tone: "accent-green"
  },
  {
    id: "sleep",
    label: "Giấc ngủ",
    value: 74,
    trend: -3,
    tone: "accent-blue"
  },
  {
    id: "focus",
    label: "Tập trung",
    value: 68,
    trend: +9,
    tone: "accent-purple"
  }
];

const defaultFocusSessions = [
  { id: "f1", title: "Nghe podcast", duration: 18 },
  { id: "f2", title: "Đọc sách", duration: 25 }
];

export const useWellnessStore = create((set, get) => ({
  userName: "Tuấn",
  mood: "Tràn đầy năng lượng",
  selectedDay: "Hôm nay",
  highlights: defaultHighlights,
  habits: defaultHabits,
  focusSessions: defaultFocusSessions,
  toggleHabit: (id) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completed: !habit.completed,
              streak: habit.completed ? Math.max(habit.streak - 1, 0) : habit.streak + 1
            }
          : habit
      )
    })),
  addFocusSession: (payload) =>
    set((state) => ({
      focusSessions: [
        { id: `session-${state.focusSessions.length + 1}`, ...payload },
        ...state.focusSessions
      ].slice(0, 4)
    })),
  updateMood: (mood) => set({ mood }),
  completeQuickAction: (action) => {
    const { addFocusSession, toggleHabit } = get();

    if (action.type === "focus") {
      addFocusSession({ title: action.title, duration: action.duration });
    }

    if (action.type === "habit") {
      toggleHabit(action.habitId);
    }
  }
}));

