import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePet } from '../contexts/PetContext';
import { useTasks } from '../contexts/TaskContext';
import { useShop } from '../contexts/ShopContext';
import { useVoice } from '../hooks/useVoice';
import PetDisplay from '../components/pet/PetDisplay';
import { getGreeting } from '../utils/time';
import { navigateTo } from '../utils/navigation';
import { OutfitType } from '../types/pet';
import { ShopItem } from '../types/shop';

const Home: React.FC = () => {
  const { state: petState, interactWithPet, feedPet, dressPet, undressPet } = usePet();
  const { state: taskState } = useTasks();
  const { state: shopState, useItem, getItemById } = useShop();
  const { 
    isListening, 
    isSupported, 
    lastResponse, 
    startListening, 
    stopListening, 
    speakText 
  } = useVoice();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const speechTimerRef = useRef<number | null>(null);

  const showSpeechForFiveSeconds = (message: string) => {
    if (!message) {
      return;
    }

    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current);
    }

    setSpeechMessage(message);
    setShowSpeechBubble(true);
    speechTimerRef.current = window.setTimeout(() => {
      setShowSpeechBubble(false);
      speechTimerRef.current = null;
    }, 5000);
  };

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // 处理语音响应显示
  useEffect(() => {
    if (lastResponse) {
      showSpeechForFiveSeconds(lastResponse);
    }
  }, [lastResponse]);

  useEffect(() => {
    return () => {
      if (speechTimerRef.current !== null) {
        window.clearTimeout(speechTimerRef.current);
      }
    };
  }, []);

  // 格式化时间
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 处理宠物交互
  const handlePetInteract = (type: 'play' | 'pet' | 'clean') => {
    interactWithPet(type);
    
    // 根据交互类型播放不同的语音
    let response = '';
    switch (type) {
      case 'play':
        response = '真好玩！谢谢你陪我玩！';
        break;
      case 'pet':
        response = '谢谢你的抚摸，我好开心！';
        break;
      case 'clean':
        response = '好舒服，谢谢你帮我清洁！';
        break;
    }
    
    speakText(response);
    showSpeechForFiveSeconds(response);
  };

  const handleUseOwnedItem = (itemId: string) => {
    const item = getItemById(itemId);

    if (!item || !petState.selectedPet) {
      return;
    }

    let message = '';

    if (item.type === 'food') {
      const success = useItem(itemId);

      if (!success) {
        showSpeechForFiveSeconds('这个食物已经用完啦。');
        return;
      }

      feedPet(itemId, item.effect || {});
      message = `你给 ${petState.selectedPet.name} 喂了 ${item.name}！`;
    } else {
      const outfitType = item.type as 'clothes' | 'hat' | 'shoes' | 'glasses';
      const isAlreadyEquipped = petState.selectedPet.currentOutfit[outfitType] === itemId;

      if (isAlreadyEquipped) {
        undressPet(outfitType);
        message = `你帮 ${petState.selectedPet.name} 脱下了 ${item.name}。`;
      } else {
        dressPet(outfitType, itemId);
        message = `你给 ${petState.selectedPet.name} 穿戴了 ${item.name}！`;
      }
    }

    speakText(message);
    showSpeechForFiveSeconds(message);
  };

  // 处理语音按钮点击
  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 获取宠物状态描述
  const getPetStatusMessage = (): string => {
    if (!petState.selectedPet) return '';
    
    const { hunger, happiness, energy } = petState.selectedPet;
    
    if (hunger < 30) return '我好饿啊，能给我点吃的吗？';
    if (happiness < 30) return '我有点不开心，能陪我玩吗？';
    if (energy < 30) return '我好累，需要休息一下。';
    if (hunger > 70 && happiness > 70 && energy > 70) return '今天真是美好的一天！';
    
    return '';
  };

  if (!petState.selectedPet) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">你还没有领养宠物</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white rounded-full px-6 py-2 font-bold"
            onClick={() => navigateTo('/select')}
          >
            去领养
          </motion.button>
        </div>
      </div>
    );
  }

  const { selectedPet } = petState;
  const isSleeping = selectedPet.isSleeping;
  const petStatusMessage = getPetStatusMessage();
  const equippedOutfits: Partial<Record<OutfitType, ShopItem>> = {
    clothes: selectedPet.currentOutfit.clothes ? getItemById(selectedPet.currentOutfit.clothes) : undefined,
    hat: selectedPet.currentOutfit.hat ? getItemById(selectedPet.currentOutfit.hat) : undefined,
    shoes: selectedPet.currentOutfit.shoes ? getItemById(selectedPet.currentOutfit.shoes) : undefined,
    glasses: selectedPet.currentOutfit.glasses ? getItemById(selectedPet.currentOutfit.glasses) : undefined,
  };
  const ownedItems = shopState.items
    .filter(item => item.isOwned)
    .map(item => getItemById(item.id))
    .filter((item): item is NonNullable<ReturnType<typeof getItemById>> => !!item);

  const quickUseItemRow = ownedItems.length > 0 && !isSleeping ? (
    <div className="bg-white/80 rounded-2xl p-3 shadow-sm md:px-4 md:py-3.5">
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {ownedItems.map(item => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14 ${
              item.type !== 'food' && selectedPet.currentOutfit[item.type as OutfitType] === item.id
                ? 'border-primary bg-primary/10'
                : 'border-transparent'
            }`}
            onClick={() => handleUseOwnedItem(item.id)}
            title={item.name}
            aria-label={item.name}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-10 w-10 object-contain md:h-12 md:w-12"
            />
          </motion.button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-4 md:px-6 md:py-6"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="mx-auto flex h-[calc(100vh-max(env(safe-area-inset-top),1rem)-1rem)] w-full max-w-4xl flex-col md:h-[calc(100vh-max(env(safe-area-inset-top),1rem)-1.5rem)]">
        {/* 顶部栏 */}
        <div className="mb-5 flex items-center justify-between md:mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">{getGreeting()}！</h1>
            <p className="text-gray-600 md:text-base">{formatTime(currentTime)}</p>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="flex items-center rounded-full bg-yellow-100 px-3 py-1 md:px-4 md:py-1.5">
              <span className="mr-2 text-yellow-500">💰</span>
              <span className="font-bold md:text-lg">{taskState.totalCoins}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm md:h-12 md:w-12"
              onClick={() => navigateTo('/tasks')}
            >
              <span className="text-lg md:text-xl">📋</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm md:h-12 md:w-12"
              onClick={() => navigateTo('/shop')}
            >
              <span className="text-lg md:text-xl">🛍️</span>
            </motion.button>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="relative flex flex-grow flex-col items-center justify-center">
          <PetDisplay
            pet={selectedPet}
            onInteract={handlePetInteract}
            isSleeping={isSleeping}
            equippedOutfits={equippedOutfits}
            extraRow={quickUseItemRow}
          />

          {/* 语音气泡 */}
          {showSpeechBubble && speechMessage && !isSleeping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-12 z-20 max-w-xs rounded-2xl bg-white p-4 shadow-lg md:right-4 md:top-16 md:max-w-sm"
            >
              <p className="text-gray-800 md:text-base">{speechMessage}</p>
            </motion.div>
          )}
        </div>

        {/* 底部栏 */}
        <div className="mt-5 flex items-center justify-between md:mt-6">
          {isSupported && !isSleeping ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm md:h-16 md:w-16 ${
                isListening ? 'bg-green-100' : ''
              }`}
              onClick={handleVoiceButtonClick}
            >
              <span className="text-2xl md:text-3xl">
                {isListening ? '🔴' : '🎤'}
              </span>
            </motion.button>
          ) : (
            <div className="h-14 w-14 md:h-16 md:w-16" />
          )}

          <div className="flex-grow" />

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm md:h-16 md:w-16"
            onClick={() => navigateTo('/settings')}
          >
            <span className="text-2xl md:text-3xl">⚙️</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Home;