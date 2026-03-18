import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pet } from '../../types/pet';

interface PetDisplayProps {
  pet: Pet;
  onInteract: (type: 'play' | 'pet' | 'clean') => void;
  isSleeping: boolean;
  extraRow?: React.ReactNode;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ pet, onInteract, isSleeping, extraRow }) => {
  const [animationIndex, setAnimationIndex] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'happy' | 'eating' | 'sleeping'>('idle');

  // 根据宠物状态选择动画
  useEffect(() => {
    if (isSleeping) {
      setCurrentAnimation('sleeping');
    } else if (pet.happiness > 80) {
      setCurrentAnimation('happy');
    } else {
      setCurrentAnimation('idle');
    }
  }, [pet.happiness, isSleeping]);

  // 动画帧切换
  useEffect(() => {
    const animationFrames = pet.animations[currentAnimation];
    if (!animationFrames || animationFrames.length === 0) return;

    const interval = setInterval(() => {
      setAnimationIndex((prev) => (prev + 1) % animationFrames.length);
    }, 500); // 每500毫秒切换一帧

    return () => clearInterval(interval);
  }, [currentAnimation, pet.animations]);

  // 处理点击事件
  const handlePetClick = () => {
    if (isSleeping) return; // 睡眠状态下不可交互
    
    // 随机选择一种交互方式
    const interactions: Array<'play' | 'pet' | 'clean'> = ['play', 'pet', 'clean'];
    const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
    onInteract(randomInteraction);
    
    // 临时切换到开心动画
    setCurrentAnimation('happy');
    setTimeout(() => {
      if (!isSleeping) {
        setCurrentAnimation('idle');
      }
    }, 2000);
  };

  const getCurrentImage = () => {
    const animationFrames = pet.animations[currentAnimation];
    if (!animationFrames || animationFrames.length === 0) {
      return isSleeping ? pet.sleepImageUrl : pet.imageUrl;
    }
    return animationFrames[animationIndex];
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {/* 宠物状态指示器 */}
      <div className="z-10 mb-4 flex w-full max-w-md justify-between gap-2 px-2 md:mb-6 md:max-w-2xl md:gap-3 md:px-0">
        <div className="flex flex-1 items-center bg-white bg-opacity-70 rounded-full px-2 py-1 min-w-0">
          <span className="text-red-500 mr-1">🍖</span>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${pet.hunger}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex flex-1 items-center bg-white bg-opacity-70 rounded-full px-2 py-1 min-w-0">
          <span className="text-yellow-500 mr-1">😊</span>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500" 
              style={{ width: `${pet.happiness}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex flex-1 items-center bg-white bg-opacity-70 rounded-full px-2 py-1 min-w-0">
          <span className="text-blue-500 mr-1">⚡</span>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${pet.energy}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* 宠物图像 */}
      <motion.div
        className="cursor-pointer"
        whileTap={{ scale: 0.95 }}
        onClick={handlePetClick}
        animate={isSleeping ? "sleeping" : "idle"}
        variants={{
          idle: {
            y: [0, -5, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            },
          },
          sleeping: {
            y: [0, 2, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            },
          },
        }}
      >
        <div className="flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white/70 shadow-md md:h-80 md:w-80">
          <img 
            src={getCurrentImage()} 
            alt={pet.name} 
            className="h-56 w-56 object-contain md:h-72 md:w-72"
          />
        </div>
        
        {/* 睡眠状态指示器 */}
        {isSleeping && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-900 bg-opacity-50 rounded-full p-4">
            <span className="text-white text-2xl">💤</span>
          </div>
        )}
      </motion.div>
      
      {/* 宠物名称 */}
      <div className="mt-3 rounded-full bg-white bg-opacity-70 px-4 py-1 text-lg font-bold md:px-5 md:py-1.5 md:text-2xl">
        {pet.name}
      </div>
      
      {/* 交互按钮 */}
      {!isSleeping && (
        <div className="mt-4 flex space-x-4 md:mt-6 md:space-x-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-xl text-white md:h-14 md:w-14 md:text-2xl"
            onClick={() => onInteract('play')}
          >
            🎮
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-xl text-white md:h-14 md:w-14 md:text-2xl"
            onClick={() => onInteract('pet')}
          >
            🖐️
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-xl text-white md:h-14 md:w-14 md:text-2xl"
            onClick={() => onInteract('clean')}
          >
            🧽
          </motion.button>
        </div>
      )}

      {extraRow && (
        <div className="mt-4 w-full max-w-md md:mt-5 md:max-w-2xl">
          {extraRow}
        </div>
      )}
    </div>
  );
};

export default PetDisplay;