import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { clearStorage, loadFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';
import { Task, TaskCompletion } from '../types/task';

const SettingsPage: React.FC = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isDevDataExpanded, setIsDevDataExpanded] = useState(false);

  const localStorageData = useMemo(() => {
    const data: Record<string, unknown> = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) {
        continue;
      }

      const rawValue = localStorage.getItem(key);
      if (rawValue === null) {
        continue;
      }

      try {
        data[key] = JSON.parse(rawValue);
      } catch {
        data[key] = rawValue;
      }
    }

    return data;
  }, [refreshCount]);

  const handleReselectPet = () => {
    removeFromStorage('selectedPet');
    window.location.href = '/select';
  };

  const isSameDay = (date: Date, compareTo: Date): boolean => {
    return (
      date.getFullYear() === compareTo.getFullYear() &&
      date.getMonth() === compareTo.getMonth() &&
      date.getDate() === compareTo.getDate()
    );
  };

  const parseDate = (value: unknown): Date | null => {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  };

  const handleClearTodayTaskRecords = () => {
    const today = new Date();
    const tasks = loadFromStorage<Task[]>('tasks') || [];
    const completions = loadFromStorage<TaskCompletion[]>('completedTasks') || [];

    const updatedTasks = tasks.map(task => {
      const lastCompletedDate = parseDate(task.lastCompleted);
      const completedToday = lastCompletedDate ? isSameDay(lastCompletedDate, today) : false;

      if (!completedToday) {
        return task;
      }

      return {
        ...task,
        isCompleted: false,
        completedToday: false,
        lastCompleted: undefined,
      };
    });

    const updatedCompletions = completions.filter(completion => {
      const completionDate = parseDate(completion.timestamp);
      return completionDate ? !isSameDay(completionDate, today) : false;
    });

    saveToStorage('tasks', updatedTasks);
    saveToStorage('completedTasks', updatedCompletions);
    saveToStorage('lastTaskReset', today);
    window.location.reload();
  };

  const handleAddCoins = () => {
    const currentCoins = loadFromStorage<number>('totalCoins') || 0;
    saveToStorage('totalCoins', currentCoins + 500);
    window.location.reload();
  };

  const handleClearWindowStorage = () => {
    clearStorage();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-full flex-col overflow-x-hidden md:h-[calc(100vh-3rem)] md:max-w-4xl">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm md:h-12 md:w-12"
            onClick={() => window.location.href = '/'}
          >
            <span className="text-lg md:text-xl">←</span>
          </motion.button>

          <h1 className="text-2xl font-bold text-primary md:text-3xl">设置</h1>

          <div className="h-10 w-10 md:h-12 md:w-12" />
        </div>

        <div className="grid w-full min-w-0 gap-4 md:gap-5">
          <div className="w-full min-w-0 max-w-full rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold text-gray-800 md:text-2xl">宠物设置</h2>
            <p className="mt-2 text-gray-600 md:text-lg">如需更换宠物，可以重新进入选择页。</p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 font-bold text-white md:px-5 md:py-2.5"
              onClick={handleReselectPet}
            >
              重新选择宠物
            </motion.button>
          </div>

          <div className="w-full min-w-0 max-w-full rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-800 md:text-2xl">开发数据（localStorage）</h2>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700"
                onClick={() => setIsDevDataExpanded(value => !value)}
              >
                {isDevDataExpanded ? '折叠' : '展开'}
              </motion.button>
            </div>

            <p className="mt-2 text-gray-600 md:text-base">用于快速查看当前运行时存档内容。</p>

            {isDevDataExpanded && (
              <>
                <div className="mt-3 flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700"
                    onClick={() => setRefreshCount(value => value + 1)}
                  >
                    刷新
                  </motion.button>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700"
                    onClick={handleClearTodayTaskRecords}
                  >
                    清空当天任务记录
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700"
                    onClick={handleAddCoins}
                  >
                    +500 金币
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
                    onClick={handleClearWindowStorage}
                  >
                    清空 localStorage
                  </motion.button>
                </div>

                <div className="mt-3 h-64 w-full max-w-full overflow-y-scroll overflow-x-auto rounded-xl bg-gray-900 p-4">
                  <pre className="w-full max-w-full text-xs leading-5 text-green-200 md:text-sm">
                    {JSON.stringify(localStorageData, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
