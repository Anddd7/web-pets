import React from 'react';
import { motion } from 'framer-motion';
import { ShopCategory, ShopItem, ShopItemType } from '../../types/shop';

interface ShopListProps {
  items: ShopItem[];
  categories: ShopCategory[];
  onBuyItem: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  selectedCategory: ShopItemType;
  onSelectCategory: (category: ShopItemType) => void;
  coins: number;
  showOwnedOnly: boolean;
  onToggleShowOwned: () => void;
}

const ShopList: React.FC<ShopListProps> = ({
  items,
  categories,
  onBuyItem,
  onUseItem,
  selectedCategory,
  onSelectCategory,
  coins,
  showOwnedOnly,
  onToggleShowOwned,
}) => {
  // 根据选择的分类和是否只显示已拥有的物品过滤
  const filteredItems = items.filter(item => {
    const matchesCategory = item.type === selectedCategory;
    const matchesOwned = showOwnedOnly ? item.isOwned : true;
    return matchesCategory && matchesOwned;
  });

  // 获取物品效果描述
  const getEffectDescription = (item: ShopItem): string => {
    if (!item.effect) return '';
    
    const effects = [];
    if (item.effect.hunger) effects.push(`饱食度 +${item.effect.hunger}`);
    if (item.effect.happiness) effects.push(`开心度 +${item.effect.happiness}`);
    if (item.effect.energy) effects.push(`能量 +${item.effect.energy}`);
    
    return effects.join(', ');
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center bg-yellow-100 rounded-full px-3 py-1">
          <span className="text-yellow-500 mr-2">💰</span>
          <span className="font-bold">{coins}</span>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1 rounded-full text-sm ${
            showOwnedOnly 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={onToggleShowOwned}
        >
          {showOwnedOnly ? '已拥有' : '全部'}
        </motion.button>
      </div>

      {/* 分类选择器 */}
      <div className="flex h-14 min-h-14 flex-shrink-0 items-center overflow-x-auto mb-4 scrollbar-hide pb-2">
        {categories.map(category => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex h-10 min-h-10 flex-shrink-0 items-center whitespace-nowrap px-4 rounded-full mr-2 leading-none ${
              selectedCategory === category.id 
                ? 'bg-primary text-white font-bold' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => onSelectCategory(category.id as ShopItemType)}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* 物品列表 */}
      <div className="flex-grow overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <span className="text-4xl mb-2">🛍️</span>
            <p className="text-lg">
              {showOwnedOnly ? '还没有购买此类物品' : '没有找到物品'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-xl p-4 shadow-sm border ${
                  item.isOwned 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 flex items-center justify-center mb-2">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h3 className="font-bold text-center mb-1">{item.name}</h3>
                  
                  {item.effect && (
                    <p className="text-xs text-gray-600 text-center mb-2">
                      {getEffectDescription(item)}
                    </p>
                  )}
                  
                  {item.isOwned ? (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-full bg-green-500 text-white rounded-full py-1 text-sm font-bold"
                      onClick={() => onUseItem(item.id)}
                    >
                      {item.type === 'food' ? '使用' : '穿戴'}
                    </motion.button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-yellow-500 font-bold">
                        {item.price} 💰
                      </span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={`bg-primary text-white rounded-full px-3 py-1 text-sm font-bold ${
                          coins < item.price ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => coins >= item.price && onBuyItem(item.id)}
                        disabled={coins < item.price}
                      >
                        购买
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopList;