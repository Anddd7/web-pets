/**
 * 时间相关工具函数
 */

// 检查宠物是否应该处于睡眠状态（晚上9点后，早上7点前）
export const checkPetSleepStatus = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= 21 || currentHour < 7;
};

// 格式化时间为 HH:MM 格式
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 格式化日期为 YYYY-MM-DD 格式
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 检查两个日期是否是同一天
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 检查当前时间是否在指定的时间范围内
export const isTimeInRange = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

// 获取当前时间对应的问候语
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 6) {
    return '夜深了';
  } else if (hour < 12) {
    return '早上好';
  } else if (hour < 14) {
    return '中午好';
  } else if (hour < 18) {
    return '下午好';
  } else if (hour < 22) {
    return '晚上好';
  } else {
    return '夜深了';
  }
};

// 计算两个日期之间的天数差
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffInMs / oneDay);
};