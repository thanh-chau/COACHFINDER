export interface ProgressOverview {
  totalSessions: number;
  trainingHours: number;
  averageAiScore: number;
  activeCoaches: number;
  streakDays: number;
}

export interface BodyMetricEntry {
  id: number;
  measuredAt: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  note?: string;
}

export interface ExerciseProgressEntry {
  id: number;
  exerciseName: string;
  measuredAt: string;
  value: number;
  unit: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  achievedAt: string;
}

