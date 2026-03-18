export interface Task {
  id: string;
  name: string;
  description: string;
  category: 'morning' | 'afternoon' | 'evening' | 'daily';
  reward: number;      // 金币奖励
  isCompleted: boolean;
  completedToday: boolean;
  lastCompleted?: Date;
  icon: string;
  timeRange?: {
    start: string;  // 格式: "HH:MM"
    end: string;    // 格式: "HH:MM"
  };
}

export type TaskCategory = 'morning' | 'afternoon' | 'evening' | 'daily';

export interface TaskCompletion {
  taskId: string;
  timestamp: Date;
}