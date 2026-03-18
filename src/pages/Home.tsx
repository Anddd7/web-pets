import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePet } from '../contexts/PetContext';
import { useTasks } from '../contexts/TaskContext';
import { useShop } from '../contexts/ShopContext';
import { useVoice } from '../hooks/useVoice';
import PetDisplay from '../components/pet/PetDisplay';
import { getGreeting } from '../utils/time';

const Home: React.FC = () => {
  const { state: petState, interactWithPet, feedPet, dressPet } = usePet();
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
      dressPet(item.type as 'clothes' | 'hat' | 'shoes' | 'glasses', itemId);
      message = `你给 ${petState.selectedPet.name} 穿戴了 ${item.name}！`;
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
            onClick={() => window.location.href = '/select'}
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
  const ownedItems = shopState.items
    .filter(item => item.isOwned)
    .map(item => getItemById(item.id))
    .filter((item): item is NonNullable<ReturnType<typeof getItemById>> => !!item);

  const quickUseItemRow = ownedItems.length > 0 && !isSleeping ? (
    <div className="bg-white/80 rounded-2xl p-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {ownedItems.map(item => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex w-12 h-12 items-center justify-center`}
            onClick={() => handleUseOwnedItem(item.id)}
            title={item.name}
            aria-label={item.name}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-10 h-10 object-contain"
            />
          </motion.button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div
      className="flex flex-col h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{getGreeting()}！</h1>
          <p className="text-gray-600">{formatTime(currentTime)}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-yellow-100 rounded-full px-3 py-1">
            <span className="text-yellow-500 mr-2">💰</span>
            <span className="font-bold">{taskState.totalCoins}</span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
            onClick={() => window.location.href = '/tasks'}
          >
            <span className="text-lg">📋</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
            onClick={() => window.location.href = '/shop'}
          >
            <span className="text-lg">🛍️</span>
          </motion.button>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="flex-grow flex flex-col items-center justify-center relative">
        {/* 宠物显示 */}
        <PetDisplay 
          pet={selectedPet} 
          onInteract={handlePetInteract}
          isSleeping={isSleeping}
          extraRow={quickUseItemRow}
        />
        
        {/* 语音气泡 */}
        {showSpeechBubble && speechMessage && !isSleeping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-6 right-4 bg-white rounded-2xl p-4 shadow-lg max-w-xs z-20"
          >
            <p className="text-gray-800">{speechMessage}</p>
          </motion.div>
        )}
      </div>

      {/* 底部栏 */}
      <div className="flex justify-between items-center mt-4">
        {/* 语音按钮 */}
        {isSupported && !isSleeping && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-sm ${
              isListening ? 'bg-green-100' : ''
            }`}
            onClick={handleVoiceButtonClick}
          >
            <span className="text-2xl">
              {isListening ? '🔴' : '🎤'}
            </span>
          </motion.button>
        )}
        
        {/* 中间的空白区域，保持按钮居中 */}
        <div className="flex-grow"></div>
        
        {/* 设置按钮 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-sm"
          onClick={() => window.location.href = '/settings'}
        >
          <span className="text-2xl">⚙️</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Home;