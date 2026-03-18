/**
 * 本地存储工具函数
 */

// 保存数据到本地存储
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving data to localStorage: ${error}`);
  }
};

// 从本地存储加载数据
export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading data from localStorage: ${error}`);
    return null;
  }
};

// 从本地存储删除数据
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from localStorage: ${error}`);
  }
};

// 清除所有本地存储数据
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};

// 获取所有存储的键
export const getAllStorageKeys = (): string[] => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i) || '');
    }
    return keys;
  } catch (error) {
    console.error(`Error getting all keys from localStorage: ${error}`);
    return [];
  }
};