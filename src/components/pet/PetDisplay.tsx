import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OutfitType, Pet } from '../../types/pet';
import { ShopItem } from '../../types/shop';

interface PetDisplayProps {
  pet: Pet;
  onInteract: (type: 'play' | 'pet' | 'clean') => void;
  isSleeping: boolean;
  equippedOutfits: Partial<Record<OutfitType, ShopItem | undefined>>;
  extraRow?: React.ReactNode;
}

const OUTFIT_ICON_SIZES: Record<OutfitType, { width: number; height: number }> = {
  hat: { width: 88, height: 88 },
  glasses: { width: 74, height: 74 },
  clothes: { width: 112, height: 112 },
  shoes: { width: 98, height: 98 },
};

const PetDisplay: React.FC<PetDisplayProps> = ({
  pet,
  onInteract,
  isSleeping,
  equippedOutfits,
  extraRow,
}) => {
  const [displayStatus, setDisplayStatus] = useState<'normal' | 'sleeping'>('normal');

  useEffect(() => {
    setDisplayStatus(isSleeping ? 'sleeping' : 'normal');
  }, [isSleeping]);

  // 处理点击事件
  const handlePetClick = () => {
    if (isSleeping) return; // 睡眠状态下不可交互
    
    // 随机选择一种交互方式
    const interactions: Array<'play' | 'pet' | 'clean'> = ['play', 'pet', 'clean'];
    const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
    onInteract(randomInteraction);
    
    setDisplayStatus('normal');
  };

  const getPlacementClass = () => {
    if (pet.layout.placement === 'left') return 'self-start';
    if (pet.layout.placement === 'right') return 'self-end';
    return 'self-center';
  };

  const getOutfitPosition = (type: OutfitType) => {
    const anchor = pet.layout.outfitAnchors[type];
    if (type === 'hat' || type === 'glasses') {
      if (pet.orientation !== 'center') {
        const offset = pet.layout.sideOffsets[type];
        return {
          x: anchor.x + offset.x,
          y: anchor.y + offset.y,
        };
      }
    }

    return { x: anchor.x, y: anchor.y };
  };

  const renderOutfitOverlay = (type: OutfitType) => {
    const outfit = equippedOutfits[type];
    if (!outfit || displayStatus === 'sleeping') {
      return null;
    }

    const position = getOutfitPosition(type);
    const size = OUTFIT_ICON_SIZES[type];

    return (
      <img
        key={type}
        src={outfit.imageUrl}
        alt={outfit.name}
        className="pointer-events-none absolute object-contain"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `calc(50% + ${position.x}px)`,
          top: `calc(50% + ${position.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
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
        className={`relative cursor-pointer`}
        whileTap={{ scale: 0.95 }}
        onClick={handlePetClick}
        animate={displayStatus === 'sleeping' ? "sleeping" : "idle"}
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
        <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden border-4 border-white bg-white/70 shadow-md md:h-80 md:w-80">
          {displayStatus === 'sleeping' ? (
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-blue-950/65 md:h-72 md:w-72">
              <span className="text-7xl leading-none md:text-8xl" role="img" aria-label="sleeping">
                {pet.avatar.sleepingIcon}
              </span>
            </div>
          ) : (
            <img
              src={pet.avatar.normal}
              alt={pet.name}
              className="h-56 w-56 object-contain md:h-72 md:w-72"
            />
          )}

          {renderOutfitOverlay('hat')}
          {renderOutfitOverlay('glasses')}
          {renderOutfitOverlay('clothes')}
          {renderOutfitOverlay('shoes')}

          {displayStatus === 'sleeping' && (
            <div className="absolute inset-0 bg-blue-950/30"></div>
          )}
        </div>
        
        {/* 睡眠状态指示器 */}
        {displayStatus === 'sleeping' && (
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