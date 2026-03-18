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
      <div className="mb-4 flex items-center justify-between md:mb-5">
        <div className="flex items-center rounded-full bg-yellow-100 px-3 py-1 md:px-4 md:py-1.5">
          <span className="mr-2 text-yellow-500 md:text-lg">💰</span>
          <span className="font-bold md:text-lg">{coins}</span>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`rounded-full px-3 py-1 text-sm md:px-4 md:py-1.5 md:text-base ${
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
      <div className="mb-4 flex h-14 min-h-14 flex-shrink-0 items-center overflow-x-auto pb-2 scrollbar-hide md:mb-5 md:h-16 md:min-h-16">
        {categories.map(category => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            className={`mr-2 inline-flex h-10 min-h-10 flex-shrink-0 items-center whitespace-nowrap rounded-full px-4 leading-none md:h-12 md:min-h-12 md:px-5 md:text-base ${
              selectedCategory === category.id 
                ? 'bg-primary text-white font-bold' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => onSelectCategory(category.id as ShopItemType)}
          >
            <span className="mr-2 md:text-lg">{category.icon}</span>
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
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl border bg-white p-4 shadow-sm md:p-5 ${
                  item.isOwned 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h3 className="mb-1 text-center font-bold md:text-lg">{item.name}</h3>
                  
                  {item.effect && (
                    <p className="mb-3 text-center text-xs text-gray-600 md:text-sm">
                      {getEffectDescription(item)}
                    </p>
                  )}
                  
                  {item.isOwned ? (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-full rounded-full bg-green-500 py-1.5 text-sm font-bold text-white md:py-2 md:text-base"
                      onClick={() => onUseItem(item.id)}
                    >
                      {item.type === 'food' ? '使用' : '穿戴'}
                    </motion.button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="font-bold text-yellow-500 md:text-lg">
                        {item.price} 💰
                      </span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={`rounded-full bg-primary px-3 py-1 text-sm font-bold text-white md:px-4 md:py-1.5 md:text-base ${
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