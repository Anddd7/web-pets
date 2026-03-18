import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useShop } from '../contexts/ShopContext';
import { usePet } from '../contexts/PetContext';
import { useTasks } from '../contexts/TaskContext';
import { useVoice } from '../hooks/useVoice';
import ShopList from '../components/shop/ShopList';
import { ShopItemType } from '../types/shop';

const ShopPage: React.FC = () => {
  const { state: shopState, buyItem, useItem, getItemById } = useShop();
  const { state: petState, feedPet, dressPet } = usePet();
  const { state: taskState } = useTasks();
  const { speakText } = useVoice();
  const [selectedCategory, setSelectedCategory] = useState<ShopItemType>(
    shopState.categories[0]?.id ?? 'food'
  );
  const [showOwnedOnly, setShowOwnedOnly] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState<string>('');

  // 处理购买物品
  const handleBuyItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;

    const success = buyItem(itemId);
    if (success) {
      const message = `你购买了 ${item.name}，花费了 ${item.price} 金币！`;
      setLastActionMessage(message);
      setShowSuccessAnimation(true);
      speakText(message);
      
      // 3秒后隐藏成功动画
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
    }
  };

  // 处理使用物品
  const handleUseItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item || !petState.selectedPet) return;

    const success = useItem(itemId);
    if (success) {
      if (item.type === 'food') {
        // 食物类物品
        feedPet(itemId, item.effect || {});
        const message = `你给 ${petState.selectedPet.name} 喂了 ${item.name}！`;
        setLastActionMessage(message);
        speakText(message);
      } else {
        // 装扮类物品
        dressPet(item.type as 'clothes' | 'hat' | 'shoes' | 'glasses', itemId);
        const message = `你给 ${petState.selectedPet.name} 穿戴了 ${item.name}！`;
        setLastActionMessage(message);
        speakText(message);
      }
      
      setShowSuccessAnimation(true);
      
      // 3秒后隐藏成功动画
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
    }
  };

  // 切换显示已拥有物品
  const toggleShowOwned = () => {
    setShowOwnedOnly(!showOwnedOnly);
  };

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

          <h1 className="text-2xl font-bold text-primary md:text-3xl">商店</h1>

          <div className="flex items-center rounded-full bg-yellow-100 px-3 py-1 md:px-4 md:py-1.5">
            <span className="mr-2 text-yellow-500">💰</span>
            <span className="font-bold md:text-lg">{taskState.totalCoins}</span>
          </div>
        </div>

        {/* 商店列表 */}
        <div className="flex-grow overflow-hidden rounded-2xl bg-white p-4 shadow-sm md:p-5">
          <ShopList
            items={shopState.items}
            categories={shopState.categories}
            onBuyItem={handleBuyItem}
            onUseItem={handleUseItem}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            coins={taskState.totalCoins}
            showOwnedOnly={showOwnedOnly}
            onToggleShowOwned={toggleShowOwned}
          />
        </div>
      </div>

      {/* 成功购买/使用物品的动画 */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm w-full"
          >
            <div className="text-5xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">成功！</h3>
            <p className="text-gray-700">{lastActionMessage}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;