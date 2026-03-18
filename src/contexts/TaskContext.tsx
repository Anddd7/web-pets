import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, TaskCategory, TaskCompletion } from '../types/task';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import taskDefinitions from '../config/tasks.json';

interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  reward: number;
  icon: string;
  timeRange?: {
    start: string;
    end: string;
  };
}

type TaskCompletionResult = {
  success: boolean;
  message?: string;
};

const buildDefaultTasks = (): Task[] => {
  return (taskDefinitions as TaskDefinition[]).map(task => ({
    ...task,
    isCompleted: false,
    completedToday: false,
  }));
};

const DEFAULT_TASKS: Task[] = buildDefaultTasks();

interface TaskState {
  tasks: Task[];
  completedTasks: TaskCompletion[];
  totalCoins: number;
  isLoading: boolean;
}

type TaskAction =
  | { type: 'LOAD_TASKS'; payload: { tasks: Task[]; completedTasks: TaskCompletion[]; totalCoins: number } }
  | { type: 'COMPLETE_TASK'; payload: { taskId: string; timestamp: Date } }
  | { type: 'RESET_DAILY_TASKS' }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'SPEND_COINS'; payload: number }
  | { type: 'RESET_TASKS' };

const initialState: TaskState = {
  tasks: DEFAULT_TASKS,
  completedTasks: [],
  totalCoins: 0,
  isLoading: true,
};

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const isDifferentDay = (date: Date | null, today: Date): boolean => {
  if (!date) {
    return true;
  }

  return (
    date.getDate() !== today.getDate() ||
    date.getMonth() !== today.getMonth() ||
    date.getFullYear() !== today.getFullYear()
  );
};

const normalizeTasks = (tasks: Task[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    lastCompleted: task.lastCompleted ? toDate(task.lastCompleted) || undefined : undefined,
  }));
};

const normalizeCompletions = (completions: TaskCompletion[]): TaskCompletion[] => {
  return completions
    .map(completion => {
      const parsedTimestamp = toDate(completion.timestamp);

      if (!parsedTimestamp) {
        return null;
      }

      return {
        ...completion,
        timestamp: parsedTimestamp,
      };
    })
    .filter((completion): completion is TaskCompletion => completion !== null);
};

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  completeTask: (taskId: string) => TaskCompletionResult;
  getTasksByCategory: (category: TaskCategory) => Task[];
  getAvailableTasks: () => Task[];
  getCompletedTasksToday: () => Task[];
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
} | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'LOAD_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        completedTasks: action.payload.completedTasks,
        totalCoins: action.payload.totalCoins,
        isLoading: false,
      };

    case 'COMPLETE_TASK':
      const { taskId, timestamp } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      
      if (!task || task.completedToday) {
        return state;
      }

      const updatedTasks = state.tasks.map(t => 
        t.id === taskId 
          ? { ...t, isCompleted: true, completedToday: true, lastCompleted: timestamp }
          : t
      );

      const newCompletion: TaskCompletion = {
        taskId,
        timestamp,
      };

      const newTotalCoins = state.totalCoins + task.reward;

      // 保存到本地存储
      saveToStorage('tasks', updatedTasks);
      saveToStorage('completedTasks', [...state.completedTasks, newCompletion]);
      saveToStorage('totalCoins', newTotalCoins);

      return {
        ...state,
        tasks: updatedTasks,
        completedTasks: [...state.completedTasks, newCompletion],
        totalCoins: newTotalCoins,
      };

    case 'RESET_DAILY_TASKS':
      const resetTasks = state.tasks.map(t => ({
        ...t,
        isCompleted: false,
        completedToday: false,
      }));

      saveToStorage('tasks', resetTasks);

      return {
        ...state,
        tasks: resetTasks,
      };

    case 'ADD_COINS':
      const coinsAdded = state.totalCoins + action.payload;
      saveToStorage('totalCoins', coinsAdded);
      return {
        ...state,
        totalCoins: coinsAdded,
      };

    case 'SPEND_COINS':
      if (state.totalCoins < action.payload) {
        return state;
      }

      const coinsSpent = state.totalCoins - action.payload;
      saveToStorage('totalCoins', coinsSpent);
      return {
        ...state,
        totalCoins: coinsSpent,
      };

    case 'RESET_TASKS':
      saveToStorage('tasks', DEFAULT_TASKS);
      saveToStorage('completedTasks', []);
      saveToStorage('totalCoins', 0);

      return {
        ...state,
        tasks: DEFAULT_TASKS,
        completedTasks: [],
        totalCoins: 0,
      };

    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // 加载保存的任务数据
  useEffect(() => {
    const savedTasks = loadFromStorage<Task[]>('tasks');
    const savedCompletedTasks = loadFromStorage<TaskCompletion[]>('completedTasks');
    const savedTotalCoins = loadFromStorage<number>('totalCoins');

    if (savedTasks && savedCompletedTasks !== null && savedTotalCoins !== null) {
      const normalizedTasks = normalizeTasks(savedTasks);
      const normalizedCompletedTasks = normalizeCompletions(savedCompletedTasks || []);

      dispatch({
        type: 'LOAD_TASKS',
        payload: {
          tasks: normalizedTasks,
          completedTasks: normalizedCompletedTasks,
          totalCoins: savedTotalCoins || 0,
        },
      });
    } else {
      // 检查是否需要重置每日任务
      const lastReset = toDate(loadFromStorage<unknown>('lastTaskReset'));
      const today = new Date();
      const isNewDay = isDifferentDay(lastReset, today);

      if (isNewDay) {
        dispatch({ type: 'RESET_DAILY_TASKS' });
        saveToStorage('lastTaskReset', today);
      } else {
        dispatch({
          type: 'LOAD_TASKS',
          payload: {
            tasks: DEFAULT_TASKS,
            completedTasks: [],
            totalCoins: 0,
          },
        });
      }
    }
  }, []);

  // 每天重置任务
  useEffect(() => {
    const checkAndResetTasks = () => {
      const lastReset = toDate(loadFromStorage<unknown>('lastTaskReset'));
      const today = new Date();
      const isNewDay = isDifferentDay(lastReset, today);

      if (isNewDay) {
        dispatch({ type: 'RESET_DAILY_TASKS' });
        saveToStorage('lastTaskReset', today);
      }
    };

    // 立即检查一次
    checkAndResetTasks();

    // 设置定时器，每小时检查一次
    const interval = setInterval(checkAndResetTasks, 3600000);

    return () => clearInterval(interval);
  }, []);

  const completeTask = (taskId: string): TaskCompletionResult => {
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task || task.completedToday) {
      return {
        success: false,
        message: '这个任务今天已经完成过了。',
      };
    }

    // 检查时间范围
    if (task.timeRange) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = task.timeRange.start.split(':').map(Number);
      const [endHour, endMinute] = task.timeRange.end.split(':').map(Number);
      
      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute;

      if (currentTimeInMinutes < startTimeInMinutes || currentTimeInMinutes > endTimeInMinutes) {
        return {
          success: false,
          message: `不在任务时间范围内（${task.timeRange.start} - ${task.timeRange.end}）。`,
        };
      }
    }

    dispatch({
      type: 'COMPLETE_TASK',
      payload: {
        taskId,
        timestamp: new Date(),
      },
    });

    return { success: true };
  };

  const getTasksByCategory = (category: TaskCategory): Task[] => {
    return state.tasks.filter(task => task.category === category);
  };

  const getAvailableTasks = (): Task[] => {
    return state.tasks.filter(task => !task.completedToday);
  };

  const getCompletedTasksToday = (): Task[] => {
    return state.tasks.filter(task => task.completedToday);
  };

  const addCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', payload: amount });
  };

  const spendCoins = (amount: number): boolean => {
    if (state.totalCoins < amount) {
      return false;
    }
    
    dispatch({ type: 'SPEND_COINS', payload: amount });
    return true;
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        completeTask,
        getTasksByCategory,
        getAvailableTasks,
        getCompletedTasksToday,
        addCoins,
        spendCoins,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};