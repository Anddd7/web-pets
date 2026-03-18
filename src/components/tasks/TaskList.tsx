import React from 'react';
import { motion } from 'framer-motion';
import { Task, TaskCategory } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  selectedCategory: TaskCategory | 'all';
  onSelectCategory: (category: TaskCategory | 'all') => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  selectedCategory,
  onSelectCategory,
}) => {
  // 根据选择的分类过滤任务
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  // 分类标签
  const categories = [
    { id: 'all', name: '全部', icon: '📋' },
    { id: 'morning', name: '早晨', icon: '🌅' },
    { id: 'afternoon', name: '下午', icon: '☀️' },
    { id: 'evening', name: '晚上', icon: '🌙' },
    { id: 'daily', name: '日常', icon: '⭐' },
  ];

  // 获取任务图标
  const getTaskIcon = (task: Task): string => {
    const iconMap: Record<string, string> = {
      sun: '☀️',
      tooth: '🦷',
      coffee: '☕',
      school: '🏫',
      book: '📚',
      utensils: '🍽️',
      bath: '🛁',
      moon: '🌙',
      activity: '🏃',
      'book-open': '📖',
      home: '🏠',
    };
    
    return iconMap[task.icon] || '📋';
  };

  const getIsTaskExpired = (task: Task): boolean => {
    if (!task.timeRange || task.completedToday) {
      return false;
    }

    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const [endHour, endMinute] = task.timeRange.end.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes > endTimeInMinutes;
  };

  return (
    <div className="flex flex-col h-full">
      {/* 分类选择器 */}
      <div className="flex h-14 min-h-14 flex-shrink-0 items-center overflow-x-auto mb-4 scrollbar-hide pb-4">
        {categories.map(category => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex h-10 min-h-10 flex-shrink-0 items-center whitespace-nowrap px-4 rounded-full mr-2 leading-none ${
              selectedCategory === category.id 
                ? 'bg-primary text-white font-bold' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => onSelectCategory(category.id as TaskCategory | 'all')}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="flex-grow overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <span className="text-4xl mb-2">📝</span>
            <p className="text-lg">没有找到任务</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {filteredTasks.map(task => {
              const isExpired = getIsTaskExpired(task);
              const isDisabled = task.completedToday || isExpired;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                  className={`bg-white rounded-xl p-4 shadow-sm border ${
                    task.completedToday
                      ? 'border-green-200 bg-green-50'
                      : isExpired
                        ? 'border-gray-200 bg-gray-100 opacity-60'
                        : 'border-gray-200 cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && onTaskClick(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          task.completedToday
                            ? 'bg-green-500 text-white'
                            : isExpired
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {task.completedToday ? '✓' : getTaskIcon(task)}
                      </div>

                      <div>
                        <h3 className={`font-bold ${task.completedToday ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {task.name}
                        </h3>
                        <p className={`text-sm ${task.completedToday ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-yellow-500 font-bold flex items-center">
                        <span className="mr-1">💰</span>
                        {task.reward}
                      </span>

                      {task.timeRange && (
                        <span className="text-xs text-gray-500">
                          {task.timeRange.start} - {task.timeRange.end}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.completedToday && (
                    <div className="mt-2 text-xs text-green-600 flex items-center justify-end">
                      <span className="mr-1">✓ 已完成</span>
                    </div>
                  )}

                  {isExpired && !task.completedToday && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center justify-end">
                      <span className="mr-1">⏰ 已过期</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;