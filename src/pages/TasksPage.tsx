import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../contexts/TaskContext';
import { useVoice } from '../hooks/useVoice';
import TaskList from '../components/tasks/TaskList';
import { Task, TaskCategory } from '../types/task';

const TasksPage: React.FC = () => {
  const { state, completeTask } = useTasks();
  const { speakText } = useVoice();
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<string>('');
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const [failureMessage, setFailureMessage] = useState<string>('');

  useEffect(() => {
    if (!failureMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFailureMessage('');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [failureMessage]);

  // 点击任务 panel 后弹出确认框
  const handleTaskClick = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.completedToday) {
      return;
    }

    setPendingTask(task);
  };

  // 确认完成任务
  const handleConfirmCompleteTask = () => {
    if (!pendingTask) {
      return;
    }

    const task = pendingTask;
    const result = completeTask(task.id);
    setPendingTask(null);

    if (!result.success) {
      const message = result.message || `任务 ${task.name} 暂时不能完成。`;
      setFailureMessage(message);
      speakText(message);
      return;
    }

    setLastCompletedTask(task.name);
    setShowSuccessAnimation(true);
    
    // 播放完成任务的语音
    speakText(`太棒了！你完成了${task.name}任务，获得了${task.reward}金币！`);
    
    // 3秒后隐藏成功动画
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);
  };

  // 计算今日完成的任务数量和总奖励
  const completedTasksToday = state.tasks.filter(task => task.completedToday);
  const totalRewardToday = completedTasksToday.reduce((sum, task) => sum + task.reward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col md:h-[calc(100vh-3rem)]">
      {/* 顶部栏 */}
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm md:h-12 md:w-12"
          onClick={() => window.location.href = '/'}
        >
          <span className="text-lg md:text-xl">←</span>
        </motion.button>
        
        <h1 className="text-2xl font-bold text-primary md:text-3xl">每日任务</h1>
        
        <div className="flex items-center rounded-full bg-yellow-100 px-3 py-1 md:px-4 md:py-1.5">
          <span className="mr-2 text-yellow-500 md:text-lg">💰</span>
          <span className="font-bold md:text-lg">{state.totalCoins}</span>
        </div>
      </div>

      {/* 今日进度 */}
      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm md:mb-5 md:p-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-800 md:text-xl">今日进度</h2>
            <p className="text-sm text-gray-600 md:text-base">
              已完成 {completedTasksToday.length}/{state.tasks.length} 个任务
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-yellow-500 md:text-lg">今日收入</p>
            <p className="text-sm text-gray-600 md:text-base">{totalRewardToday} 金币</p>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mt-3 bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedTasksToday.length / state.tasks.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="bg-primary h-full rounded-full"
          ></motion.div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-grow overflow-hidden rounded-xl bg-white p-4 shadow-sm md:p-5">
        <TaskList
          tasks={state.tasks}
          onTaskClick={handleTaskClick}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      </div>

      {/* 任务确认对话框 */}
      {pendingTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">确认完成任务</h3>
            <p className="text-gray-700">你确定已完成 “{pendingTask.name}” 吗？</p>
            <p className="text-yellow-600 font-bold mt-3">奖励：💰 {pendingTask.reward}</p>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-gray-200 text-gray-700 py-2 font-bold"
                onClick={() => setPendingTask(null)}
              >
                取消
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-primary text-white py-2 font-bold"
                onClick={handleConfirmCompleteTask}
              >
                确认完成
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 任务失败提示 */}
      {failureMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 shadow-lg max-w-sm w-full"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-700 text-sm leading-relaxed">{failureMessage}</p>
              <button
                className="text-red-500 text-sm font-bold"
                onClick={() => setFailureMessage('')}
              >
                关闭
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 成功完成任务的动画 */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm w-full"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">任务完成！</h3>
            <p className="text-gray-700">你完成了 "{lastCompletedTask}"</p>
            <p className="text-yellow-500 font-bold mt-2">获得奖励：💰 {state.tasks.find(t => t.name === lastCompletedTask)?.reward || 0}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;